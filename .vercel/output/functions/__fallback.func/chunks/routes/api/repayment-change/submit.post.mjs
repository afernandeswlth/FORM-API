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

const FORM_TYPE = "repayment_change";
const FORM_NAME = "Repayment Change Request";
const submit_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  const body = await readBody(event);
  if (!((_a = body.borrowers) == null ? void 0 : _a.length)) {
    throw createError({ statusCode: 400, message: "At least one borrower is required." });
  }
  for (const b of body.borrowers) {
    if (!((_b = b.surname) == null ? void 0 : _b.trim()) || !((_c = b.given_names) == null ? void 0 : _c.trim())) {
      throw createError({ statusCode: 400, message: "Borrower surname and given name(s) are required." });
    }
  }
  if (!((_d = body.repayment_changes) == null ? void 0 : _d.length)) {
    throw createError({ statusCode: 400, message: "At least one repayment change is required." });
  }
  for (const c of body.repayment_changes) {
    if (!((_e = c.loan_account_number) == null ? void 0 : _e.trim())) {
      throw createError({ statusCode: 400, message: "Loan account number is required for each change." });
    }
    if (!(c.new_amount > 0)) {
      throw createError({ statusCode: 400, message: "New repayment amount must be greater than zero." });
    }
    if (!["weekly", "fortnightly", "monthly"].includes(c.frequency)) {
      throw createError({ statusCode: 400, message: "Payment frequency must be weekly, fortnightly, or monthly." });
    }
  }
  if (((_f = body.authorisations) == null ? void 0 : _f.length) !== body.borrowers.length) {
    throw createError({ statusCode: 400, message: "An authorisation is required for each borrower." });
  }
  for (const auth of body.authorisations) {
    if (!((_g = auth.signature_base64) == null ? void 0 : _g.trim())) {
      throw createError({ statusCode: 400, message: "Signature is required for each borrower." });
    }
    if (!((_h = auth.signed_date) == null ? void 0 : _h.trim())) {
      throw createError({ statusCode: 400, message: "Date is required for each borrower authorisation." });
    }
  }
  const id = createSubmission(FORM_TYPE, body);
  const created_at = (/* @__PURE__ */ new Date()).toISOString();
  const names = body.borrowers.map((b) => `${b.given_names} ${b.surname}`).join(" & ");
  const primaryLoan = body.repayment_changes[0].loan_account_number;
  const pdfBuffer = await buildPdf((doc) => {
    var _a2;
    header(doc, FORM_NAME, `Submission ID: ${id}  |  ${created_at}`);
    borrowersTable(doc, body.borrowers);
    sectionTitle(doc, "Repayment Changes");
    body.repayment_changes.forEach((change, i) => {
      const freq = change.frequency.charAt(0).toUpperCase() + change.frequency.slice(1);
      labelValue(doc, `Change ${i + 1} \u2013 Loan Account`, change.loan_account_number);
      labelValue(doc, "New Repayment Amount", `$${change.new_amount.toFixed(2)}`);
      labelValue(doc, "Payment Frequency", freq);
      doc.moveDown(0.3);
    });
    if ((_a2 = body.comments) == null ? void 0 : _a2.trim()) {
      sectionTitle(doc, "Additional Comments");
      labelValue(doc, "Comments", body.comments.trim());
    }
    body.borrowers.forEach((borrower, i) => {
      signature(doc, borrower, body.authorisations[i]);
    });
    pageFooter(doc, FORM_NAME);
  });
  const subject = `Repayment Change \u2013 ${names}`;
  const replyToMsgId = getThreadMessageId(FORM_TYPE, primaryLoan);
  const body_text = [
    `Form: ${FORM_NAME}`,
    `Submission ID: ${id}`,
    `Date: ${created_at}`,
    "",
    `Borrower(s): ${names}`,
    "",
    "Repayment Changes:",
    ...body.repayment_changes.map((c, i) => {
      const freq = c.frequency.charAt(0).toUpperCase() + c.frequency.slice(1);
      return `  ${i + 1}. Loan: ${c.loan_account_number} | Amount: $${c.new_amount.toFixed(2)} | Frequency: ${freq}`;
    }),
    "",
    ((_i = body.comments) == null ? void 0 : _i.trim()) ? `Comments: ${body.comments.trim()}` : ""
  ].filter((l) => l !== void 0).join("\n");
  const messageId = await sendSubmissionEmail({
    subject,
    body: body_text,
    pdfBuffer,
    pdfFilename: `repayment-change-${id}.pdf`,
    replyToMessageId: replyToMsgId
  });
  saveThreadMessageId(FORM_TYPE, primaryLoan, messageId);
  return {
    id,
    status: "submitted",
    created_at
  };
});

export { submit_post as default };
//# sourceMappingURL=submit.post.mjs.map
