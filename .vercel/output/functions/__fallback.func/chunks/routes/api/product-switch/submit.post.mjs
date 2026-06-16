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

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}
function isPositiveInt(v) {
  return typeof v === "number" && Number.isInteger(v) && v >= 1;
}
function isPositiveNumber(v) {
  return typeof v === "number" && v > 0;
}
function validateBody(body) {
  if (!body || typeof body !== "object") {
    throw createError({ statusCode: 400, message: "Invalid request body" });
  }
  const b = body;
  if (!Array.isArray(b.borrowers) || b.borrowers.length === 0) {
    throw createError({ statusCode: 400, message: "At least one borrower is required" });
  }
  for (let i = 0; i < b.borrowers.length; i++) {
    const bor = b.borrowers[i];
    if (!isNonEmptyString(bor == null ? void 0 : bor.surname)) {
      throw createError({ statusCode: 400, message: `Borrower ${i + 1}: surname is required` });
    }
    if (!isNonEmptyString(bor == null ? void 0 : bor.given_names)) {
      throw createError({ statusCode: 400, message: `Borrower ${i + 1}: given_names is required` });
    }
  }
  if (!Array.isArray(b.loan_switches) || b.loan_switches.length === 0) {
    throw createError({ statusCode: 400, message: "At least one loan switch is required" });
  }
  if (b.loan_switches.length > 3) {
    throw createError({ statusCode: 400, message: "Maximum 3 loan switches allowed" });
  }
  for (let i = 0; i < b.loan_switches.length; i++) {
    const sw = b.loan_switches[i];
    if (!isNonEmptyString(sw == null ? void 0 : sw.loan_account_number)) {
      throw createError({ statusCode: 400, message: `Loan switch ${i + 1}: loan_account_number is required` });
    }
    if (!["principal_and_interest", "interest_only"].includes(sw == null ? void 0 : sw.repayment_type)) {
      throw createError({ statusCode: 400, message: `Loan switch ${i + 1}: invalid repayment_type` });
    }
    if (sw.repayment_type === "interest_only" && !isPositiveInt(sw == null ? void 0 : sw.interest_only_years)) {
      throw createError({ statusCode: 400, message: `Loan switch ${i + 1}: interest_only_years must be an integer >= 1` });
    }
    if (!["variable", "fixed"].includes(sw == null ? void 0 : sw.rate_type)) {
      throw createError({ statusCode: 400, message: `Loan switch ${i + 1}: invalid rate_type` });
    }
    if (sw.rate_type === "fixed") {
      if (!isPositiveNumber(sw == null ? void 0 : sw.fixed_rate_percent)) {
        throw createError({ statusCode: 400, message: `Loan switch ${i + 1}: fixed_rate_percent must be > 0` });
      }
      if (!isPositiveInt(sw == null ? void 0 : sw.fixed_period_years)) {
        throw createError({ statusCode: 400, message: `Loan switch ${i + 1}: fixed_period_years must be an integer >= 1` });
      }
    }
  }
  if (!Array.isArray(b.authorisations) || b.authorisations.length !== b.borrowers.length) {
    throw createError({ statusCode: 400, message: "Authorisation count must match borrower count" });
  }
  for (let i = 0; i < b.authorisations.length; i++) {
    const auth = b.authorisations[i];
    if (!isNonEmptyString(auth == null ? void 0 : auth.signature_base64)) {
      throw createError({ statusCode: 400, message: `Authorisation ${i + 1}: signature is required` });
    }
    if (!isNonEmptyString(auth == null ? void 0 : auth.signed_date)) {
      throw createError({ statusCode: 400, message: `Authorisation ${i + 1}: signed_date is required` });
    }
  }
  return b;
}
async function buildProductSwitchPdf(data) {
  return buildPdf((doc) => {
    const names = data.borrowers.map((b) => `${b.given_names} ${b.surname}`).join(", ");
    header(doc, "Product Switch Request", `Submitted: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-AU")}  |  Borrower(s): ${names}`);
    borrowersTable(doc, data.borrowers);
    sectionTitle(doc, "Loan Switch Details");
    data.loan_switches.forEach((sw, i) => {
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#1a1a2e").text(`Loan Switch ${i + 1}`, { underline: false });
      doc.moveDown(0.2);
      labelValue(doc, "Loan Account Number", sw.loan_account_number);
      labelValue(
        doc,
        "Repayment Type",
        sw.repayment_type === "interest_only" ? "Interest Only" : "Principal & Interest"
      );
      if (sw.repayment_type === "interest_only") {
        labelValue(doc, "IO Term (Years)", String(sw.interest_only_years));
      }
      labelValue(
        doc,
        "Rate Type",
        sw.rate_type === "fixed" ? "Fixed" : "Variable"
      );
      if (sw.rate_type === "fixed") {
        labelValue(doc, "Fixed Rate (%)", String(sw.fixed_rate_percent));
        labelValue(doc, "Fixed Period (Years)", String(sw.fixed_period_years));
      }
      doc.moveDown(0.5);
    });
    if (data.reason_for_request) {
      sectionTitle(doc, "Reason for Request");
      doc.font("Helvetica").fontSize(9).fillColor("#000000").text(data.reason_for_request);
      doc.moveDown(0.8);
    }
    data.borrowers.forEach((borrower, i) => {
      const auth = data.authorisations[i];
      signature(doc, borrower, {
        signature_base64: auth.signature_base64,
        signed_date: auth.signed_date,
        home_contact: auth.home_contact,
        work_contact: auth.work_contact
      });
    });
    pageFooter(doc, "Product Switch Request");
  });
}
const submit_post = defineEventHandler(async (event) => {
  const rawBody = await readBody(event);
  const data = validateBody(rawBody);
  const id = createSubmission("product_switch", data);
  const names = data.borrowers.map((b) => `${b.given_names} ${b.surname}`).join(" & ");
  const subject = `Product Switch Request \u2013 ${names}`;
  const threadKey = data.loan_switches[0].loan_account_number.trim();
  const existingMessageId = getThreadMessageId("product_switch", threadKey);
  const pdfBuffer = await buildProductSwitchPdf(data);
  const loanList = data.loan_switches.map((sw, i) => {
    const parts = [`  Loan ${i + 1}: ${sw.loan_account_number}`];
    parts.push(`    Repayment: ${sw.repayment_type === "interest_only" ? `Interest Only (${sw.interest_only_years}yr)` : "Principal & Interest"}`);
    parts.push(`    Rate: ${sw.rate_type === "fixed" ? `Fixed ${sw.fixed_rate_percent}% for ${sw.fixed_period_years}yr` : "Variable"}`);
    return parts.join("\n");
  }).join("\n");
  const emailBody = [
    `Product Switch Request`,
    `Submitted: ${(/* @__PURE__ */ new Date()).toISOString()}`,
    `Reference: ${id}`,
    ``,
    `Borrower(s): ${names}`,
    ``,
    `Loan Switches:`,
    loanList,
    data.reason_for_request ? `
Reason for Request:
${data.reason_for_request}` : "",
    ``,
    `Please see the attached PDF for full details and signatures.`
  ].filter((line) => line !== void 0).join("\n");
  const sentMessageId = await sendSubmissionEmail({
    subject,
    body: emailBody,
    pdfBuffer,
    pdfFilename: `product-switch-${id}.pdf`,
    replyToMessageId: existingMessageId
  });
  saveThreadMessageId("product_switch", threadKey, sentMessageId);
  const created_at = (/* @__PURE__ */ new Date()).toISOString();
  return { id, status: "submitted", created_at };
});

export { submit_post as default };
//# sourceMappingURL=submit.post.mjs.map
