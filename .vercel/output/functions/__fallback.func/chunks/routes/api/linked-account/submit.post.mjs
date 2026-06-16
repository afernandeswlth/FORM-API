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
  var _a, _b, _c, _d, _e, _f, _g;
  const body = await readBody(event);
  if (!((_a = body == null ? void 0 : body.loan_account_number) == null ? void 0 : _a.trim())) {
    throw createError({ statusCode: 422, statusMessage: "Loan account number is required." });
  }
  if (!Array.isArray(body.borrowers) || body.borrowers.length === 0) {
    throw createError({ statusCode: 422, statusMessage: "At least one borrower is required." });
  }
  for (let i = 0; i < body.borrowers.length; i++) {
    const b = body.borrowers[i];
    if (!((_b = b == null ? void 0 : b.surname) == null ? void 0 : _b.trim()) || !((_c = b == null ? void 0 : b.given_names) == null ? void 0 : _c.trim())) {
      throw createError({ statusCode: 422, statusMessage: `Borrower ${i + 1}: surname and given names are required.` });
    }
  }
  if (!Array.isArray(body.linked_accounts) || body.linked_accounts.length === 0) {
    throw createError({ statusCode: 422, statusMessage: "At least one linked account is required." });
  }
  for (let i = 0; i < body.linked_accounts.length; i++) {
    const acc = body.linked_accounts[i];
    if (!((_d = acc == null ? void 0 : acc.bank_name) == null ? void 0 : _d.trim())) {
      throw createError({ statusCode: 422, statusMessage: `Account ${i + 1}: bank name is required.` });
    }
    if (!((_e = acc == null ? void 0 : acc.account_name) == null ? void 0 : _e.trim())) {
      throw createError({ statusCode: 422, statusMessage: `Account ${i + 1}: account name is required.` });
    }
    if (!/^\d{3}-\d{3}$/.test((_f = acc == null ? void 0 : acc.bsb) != null ? _f : "")) {
      throw createError({ statusCode: 422, statusMessage: `Account ${i + 1}: BSB must be in format 000-000.` });
    }
    if (!((_g = acc == null ? void 0 : acc.account_number) == null ? void 0 : _g.trim())) {
      throw createError({ statusCode: 422, statusMessage: `Account ${i + 1}: account number is required.` });
    }
    if (!(acc == null ? void 0 : acc.bank_statement_data)) {
      throw createError({ statusCode: 422, statusMessage: `Account ${i + 1}: bank statement is required.` });
    }
  }
  if (!Array.isArray(body.authorisations) || body.authorisations.length !== body.borrowers.length) {
    throw createError({ statusCode: 422, statusMessage: "Authorisations must match number of borrowers." });
  }
  for (let i = 0; i < body.authorisations.length; i++) {
    const auth = body.authorisations[i];
    if (!(auth == null ? void 0 : auth.signed_date)) {
      throw createError({ statusCode: 422, statusMessage: `Borrower ${i + 1} authorisation: date is required.` });
    }
    if (!(auth == null ? void 0 : auth.signature_base64)) {
      throw createError({ statusCode: 422, statusMessage: `Borrower ${i + 1} authorisation: signature is required.` });
    }
  }
  const id = createSubmission("linked-account", body);
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  const loanNo = body.loan_account_number.trim();
  const borrowerNames = body.borrowers.map((b) => `${b.given_names} ${b.surname}`).join(", ");
  const pdfBuffer = await buildPdf((doc) => {
    header(doc, "Linked Account Nomination", `Submitted: ${new Date(createdAt).toLocaleDateString("en-AU", { day: "2-digit", month: "long", year: "numeric" })}`);
    borrowersTable(doc, body.borrowers);
    sectionTitle(doc, "Loan Details");
    labelValue(doc, "Loan Account Number", loanNo);
    sectionTitle(doc, "Linked Bank Accounts");
    body.linked_accounts.forEach((acc, i) => {
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#1a1a2e").text(`Account ${i + 1}`, { underline: false });
      doc.moveDown(0.2);
      labelValue(doc, "Bank Name", acc.bank_name);
      labelValue(doc, "Account Name", acc.account_name);
      labelValue(doc, "BSB", acc.bsb);
      labelValue(doc, "Account Number", acc.account_number);
      if (acc.bank_statement_filename) {
        labelValue(doc, "Bank Statement", acc.bank_statement_filename);
      }
      doc.moveDown(0.4);
    });
    body.authorisations.forEach((auth, i) => {
      var _a2, _b2, _c2;
      signature(doc, body.borrowers[i], {
        signature_base64: (_a2 = auth.signature_base64) != null ? _a2 : "",
        signed_date: auth.signed_date,
        home_contact: (_b2 = auth.home_contact) != null ? _b2 : "",
        work_contact: (_c2 = auth.work_contact) != null ? _c2 : ""
      });
    });
    pageFooter(doc, "Linked Account Nomination");
  });
  const existingThreadId = getThreadMessageId("linked-account", loanNo);
  const accountLines = body.linked_accounts.map(
    (acc, i) => {
      var _a2;
      return `  Account ${i + 1}:
    Bank:       ${acc.bank_name}
    Name:       ${acc.account_name}
    BSB:        ${acc.bsb}
    Number:     ${acc.account_number}
    Statement:  ${(_a2 = acc.bank_statement_filename) != null ? _a2 : "attached as data URI"}`;
    }
  ).join("\n\n");
  const emailBody = [
    `Linked Account Nomination`,
    ``,
    `Loan Account Number: ${loanNo}`,
    `Borrower(s): ${borrowerNames}`,
    `Submission ID: ${id}`,
    `Submitted: ${new Date(createdAt).toLocaleString("en-AU")}`,
    ``,
    `Linked Accounts:`,
    accountLines
  ].join("\n");
  const subject = `Linked Account Nomination \u2013 ${borrowerNames}`;
  const messageId = await sendSubmissionEmail({
    subject,
    body: emailBody,
    pdfBuffer,
    pdfFilename: `linked-account-${id}.pdf`,
    replyToMessageId: existingThreadId
  });
  saveThreadMessageId("linked-account", loanNo, messageId);
  return {
    id,
    status: "submitted",
    created_at: createdAt
  };
});

export { submit_post as default };
//# sourceMappingURL=submit.post.mjs.map
