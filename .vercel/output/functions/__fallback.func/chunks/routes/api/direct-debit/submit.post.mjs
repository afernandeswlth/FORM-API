import { d as defineEventHandler, r as readBody, c as createError } from '../../../nitro/nitro.mjs';
import { c as createSubmission, g as getThreadMessageId, s as sendSubmissionEmail, a as saveThreadMessageId, b as buildPdf, h as header, d as borrowersTable, e as sectionTitle, l as labelValue, f as signature, p as pageFooter } from '../../../_/pdf.mjs';
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

const FORM_TYPE = "direct_debit";
const FORM_NAME = "Direct Debit Request";
function frequencyLabel(f) {
  var _a;
  return (_a = { weekly: "Weekly", fortnightly: "Fortnightly", monthly: "Monthly" }[f]) != null ? _a : f;
}
function amountLabel(type, amount) {
  if (type === "minimum") return "Minimum Repayment";
  const formatted = amount != null ? `$${amount.toFixed(2)}` : "\u2014";
  return type === "fixed" ? `Fixed \u2013 ${formatted}` : `Other \u2013 ${formatted}`;
}
async function buildDirectDebitPdf(data) {
  return buildPdf((doc) => {
    const names = data.borrowers.map((b) => `${b.given_names} ${b.surname}`).join(" & ");
    header(doc, FORM_NAME, `Submitted for ${names} \u2013 Loan: ${data.loan_account_number}`);
    borrowersTable(doc, data.borrowers);
    sectionTitle(doc, "Loan Details");
    labelValue(doc, "Loan Account Number", data.loan_account_number);
    sectionTitle(doc, "Direct Debit Account(s)");
    data.accounts.forEach((acc, idx) => {
      doc.moveDown(0.3);
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#1a1a2e").text(`Account ${idx + 1}`, { underline: false });
      doc.moveDown(0.2);
      labelValue(doc, "Bank Name", acc.bank_name);
      labelValue(doc, "Account Name", acc.account_name);
      labelValue(doc, "BSB", acc.bsb);
      labelValue(doc, "Account Number", acc.account_number);
      labelValue(doc, "Payment Frequency", frequencyLabel(acc.payment_frequency));
      labelValue(doc, "Amount", amountLabel(acc.amount_type, acc.fixed_amount));
      if (acc.bank_statement_base64) {
        const raw = acc.bank_statement_base64.includes(",") ? acc.bank_statement_base64.split(",")[1] : acc.bank_statement_base64;
        const mimeMatch = acc.bank_statement_base64.match(/^data:([^;]+);/);
        const mime = mimeMatch ? mimeMatch[1] : "";
        if (mime === "image/png" || mime === "image/jpeg") {
          try {
            const buf = Buffer.from(raw, "base64");
            doc.moveDown(0.3);
            doc.font("Helvetica").fontSize(8).fillColor("#555555").text("Bank Statement:");
            doc.image(buf, doc.x, doc.y, { width: 300, height: 120, fit: [300, 120] });
            doc.y += 126;
          } catch {
            labelValue(doc, "Bank Statement", acc.bank_statement_filename || "[attached]");
          }
        } else {
          labelValue(doc, "Bank Statement", acc.bank_statement_filename || "[see attachment]");
        }
      }
      doc.moveDown(0.4);
    });
    data.authorisations.forEach((auth, idx) => {
      if (doc.y > 680) doc.addPage();
      signature(doc, data.borrowers[idx], auth);
    });
    pageFooter(doc, FORM_NAME);
  });
}
function validatePayload(body) {
  if (!body || typeof body !== "object") throw createError({ statusCode: 400, statusMessage: "Invalid request body" });
  const b = body;
  if (!Array.isArray(b.borrowers) || b.borrowers.length === 0)
    throw createError({ statusCode: 400, statusMessage: "At least one borrower is required" });
  for (const borrower of b.borrowers) {
    const bw = borrower;
    if (!bw.surname || !bw.given_names)
      throw createError({ statusCode: 400, statusMessage: "Each borrower must have a surname and given names" });
  }
  if (!b.loan_account_number || typeof b.loan_account_number !== "string" || !b.loan_account_number.trim())
    throw createError({ statusCode: 400, statusMessage: "Loan account number is required" });
  if (!Array.isArray(b.accounts) || b.accounts.length === 0)
    throw createError({ statusCode: 400, statusMessage: "At least one direct debit account is required" });
  for (const acc of b.accounts) {
    const a = acc;
    if (!a.bank_name || !a.account_name || !a.bsb || !a.account_number)
      throw createError({ statusCode: 400, statusMessage: "All account fields are required" });
    if (!/^\d{3}-\d{3}$/.test(String(a.bsb)))
      throw createError({ statusCode: 400, statusMessage: `Invalid BSB format: ${a.bsb}` });
    if (!a.bank_statement_base64)
      throw createError({ statusCode: 400, statusMessage: "Bank statement is required for each account" });
    if (a.amount_type === "fixed" || a.amount_type === "other") {
      const amt = Number(a.fixed_amount);
      if (isNaN(amt) || amt <= 0)
        throw createError({ statusCode: 400, statusMessage: "Amount must be greater than $0 for fixed or other amount types" });
    }
  }
  if (!Array.isArray(b.authorisations) || b.authorisations.length !== b.borrowers.length)
    throw createError({ statusCode: 400, statusMessage: "Authorisation required for each borrower" });
  for (const auth of b.authorisations) {
    const a = auth;
    if (!a.signature_base64 || !a.signed_date)
      throw createError({ statusCode: 400, statusMessage: "Signature and date are required for each borrower" });
  }
  return b;
}
const submit_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const data = validatePayload(body);
  const id = createSubmission(FORM_TYPE, data);
  const created_at = (/* @__PURE__ */ new Date()).toISOString();
  const names = data.borrowers.map((b) => `${b.given_names} ${b.surname}`).join(" & ");
  const subject = `Direct Debit Request \u2013 ${names}`;
  const emailBody = [
    `Form:               ${FORM_NAME}`,
    `Submission ID:      ${id}`,
    `Submitted:          ${created_at}`,
    ``,
    `Loan Account:       ${data.loan_account_number}`,
    ``,
    `Borrower(s):`,
    ...data.borrowers.map((b, i) => `  ${i + 1}. ${b.given_names} ${b.surname}`),
    ``,
    `Direct Debit Account(s):`,
    ...data.accounts.map((acc, i) => [
      `  Account ${i + 1}:`,
      `    Bank:       ${acc.bank_name}`,
      `    Name:       ${acc.account_name}`,
      `    BSB:        ${acc.bsb}`,
      `    Account:    ${acc.account_number}`,
      `    Frequency:  ${frequencyLabel(acc.payment_frequency)}`,
      `    Amount:     ${amountLabel(acc.amount_type, acc.fixed_amount)}`,
      `    Statement:  ${acc.bank_statement_filename || "[embedded]"}`
    ].join("\n")),
    ``,
    `Authorisations:`,
    ...data.authorisations.map((auth, i) => [
      `  Borrower ${i + 1}:`,
      `    Date:        ${auth.signed_date}`,
      auth.home_contact ? `    Home:        ${auth.home_contact}` : null,
      auth.work_contact ? `    Work:        ${auth.work_contact}` : null
    ].filter(Boolean).join("\n"))
  ].join("\n");
  const pdfBuffer = await buildDirectDebitPdf(data);
  const threadKey = data.loan_account_number;
  const existingMsgId = getThreadMessageId(FORM_TYPE, threadKey);
  const msgId = await sendSubmissionEmail({
    subject,
    body: emailBody,
    pdfBuffer,
    pdfFilename: `direct-debit-${id}.pdf`,
    replyToMessageId: existingMsgId
  });
  saveThreadMessageId(FORM_TYPE, threadKey, msgId);
  return { id, status: "submitted", created_at };
});

export { submit_post as default };
//# sourceMappingURL=submit.post.mjs.map
