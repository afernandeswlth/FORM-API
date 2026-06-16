import { d as defineEventHandler, r as readBody, c as createError } from '../../../nitro/nitro.mjs';
import { c as createSubmission, b as buildPdf, g as getThreadMessageId, s as sendSubmissionEmail, a as saveThreadMessageId, h as header, d as borrowersTable, e as sectionTitle, l as labelValue, f as signature, p as pageFooter } from '../../../_/pdf.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'fs';
import 'path';
import 'crypto';
import 'nodemailer';
import 'pdfkit';

const submit_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  const body = await readBody(event);
  if (!((_a = body.borrowers) == null ? void 0 : _a.length)) {
    throw createError({ statusCode: 400, statusMessage: "Borrowers are required" });
  }
  for (const b of body.borrowers) {
    if (!((_b = b.surname) == null ? void 0 : _b.trim()) || !((_c = b.given_names) == null ? void 0 : _c.trim())) {
      throw createError({ statusCode: 400, statusMessage: "All borrower fields are required" });
    }
  }
  if (!((_d = body.loan_account_number) == null ? void 0 : _d.trim())) {
    throw createError({ statusCode: 400, statusMessage: "Loan account number is required" });
  }
  const dest = body.redraw_destination;
  if (!((_e = dest == null ? void 0 : dest.to_account_name) == null ? void 0 : _e.trim())) {
    throw createError({ statusCode: 400, statusMessage: "To Account Name is required" });
  }
  if (!/^\d{3}-\d{3}$/.test((_f = dest.bsb) != null ? _f : "")) {
    throw createError({ statusCode: 400, statusMessage: "BSB must be in format 000-000" });
  }
  if (!/^\d+$/.test((_g = dest.account_number) != null ? _g : "")) {
    throw createError({ statusCode: 400, statusMessage: "Account number must be digits only" });
  }
  if (!dest.redraw_amount || dest.redraw_amount <= 0) {
    throw createError({ statusCode: 400, statusMessage: "Redraw amount must be greater than $0" });
  }
  if (!((_h = body.redraw_reason) == null ? void 0 : _h.trim())) {
    throw createError({ statusCode: 400, statusMessage: "Redraw reason is required" });
  }
  if (!((_i = body.authorisations) == null ? void 0 : _i.length) || body.authorisations.length !== body.borrowers.length) {
    throw createError({ statusCode: 400, statusMessage: "Authorisation required for each borrower" });
  }
  for (const auth of body.authorisations) {
    if (!auth.signed_date) {
      throw createError({ statusCode: 400, statusMessage: "Signed date required for each borrower" });
    }
    if (!auth.signature_base64) {
      throw createError({ statusCode: 400, statusMessage: "Signature required for each borrower" });
    }
  }
  const id = createSubmission("redraw", body);
  const loanNo = body.loan_account_number.trim();
  const names = body.borrowers.map((b) => `${b.given_names} ${b.surname}`).join(" & ");
  const subject = `Redraw Request \u2013 ${names}`;
  const amountFormatted = dest.redraw_amount.toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD"
  });
  const largeAmountNote = dest.redraw_amount >= 1e5 ? "\n*** NOTE: Amount is $100,000 or more \u2014 WLTH approval required ***\n" : "";
  const borrowerLines = body.borrowers.map((b, i) => `  Borrower ${i + 1}: ${b.given_names} ${b.surname}`).join("\n");
  const emailBody = [
    `Redraw Request \u2013 ${names}`,
    `Submission ID: ${id}`,
    "",
    "BORROWERS",
    borrowerLines,
    "",
    "LOAN DETAILS",
    `  Loan Account Number: ${loanNo}`,
    "",
    "REDRAW DESTINATION",
    `  To Account Name: ${dest.to_account_name}`,
    `  BSB: ${dest.bsb}`,
    `  Account Number: ${dest.account_number}`,
    `  Redraw Amount: ${amountFormatted}`,
    largeAmountNote,
    "REDRAW REASON",
    `  ${body.redraw_reason}`,
    "",
    "AUTHORISATIONS",
    ...body.authorisations.map(
      (a, i) => `  Borrower ${i + 1} \u2013 ${body.borrowers[i].given_names} ${body.borrowers[i].surname}: signed ${a.signed_date}`
    )
  ].join("\n");
  const pdfBuffer = await buildPdf((doc) => {
    header(doc, "Redraw Request", `Loan Account: ${loanNo}  |  Submitted: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-AU")}`);
    borrowersTable(doc, body.borrowers);
    sectionTitle(doc, "Loan Details");
    labelValue(doc, "Loan Account Number", loanNo);
    sectionTitle(doc, "Redraw Destination");
    labelValue(doc, "To Account Name", dest.to_account_name);
    labelValue(doc, "BSB", dest.bsb);
    labelValue(doc, "Account Number", dest.account_number);
    labelValue(doc, "Redraw Amount", amountFormatted);
    if (dest.redraw_amount >= 1e5) {
      doc.moveDown(0.3);
      const bannerY = doc.y;
      doc.rect(50, bannerY, 495, 22).fill("#fff8e1");
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#7c5200").text("APPROVAL REQUIRED: Amounts of $100,000 or more require WLTH approval.", 56, bannerY + 5, { width: 483 });
      doc.y = bannerY + 30;
    }
    sectionTitle(doc, "Redraw Reason");
    doc.font("Helvetica").fontSize(9).fillColor("#000000").text(body.redraw_reason);
    doc.moveDown(0.6);
    for (let i = 0; i < body.borrowers.length; i++) {
      signature(doc, body.borrowers[i], {
        signature_base64: body.authorisations[i].signature_base64,
        signed_date: body.authorisations[i].signed_date
      });
    }
    pageFooter(doc, "Redraw Request");
  });
  const existingThreadId = getThreadMessageId("redraw", loanNo);
  const messageId = await sendSubmissionEmail({
    subject,
    body: emailBody,
    pdfBuffer,
    pdfFilename: `redraw-request-${loanNo}-${id.slice(0, 8)}.pdf`,
    replyToMessageId: existingThreadId
  });
  saveThreadMessageId("redraw", loanNo, messageId);
  return {
    id,
    status: "submitted",
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
});

export { submit_post as default };
//# sourceMappingURL=submit.post.mjs.map
