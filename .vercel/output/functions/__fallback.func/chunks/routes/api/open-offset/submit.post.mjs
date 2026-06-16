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
  var _a;
  const body = await readBody(event);
  const errors = [];
  if (!((_a = body.linked_account_number) == null ? void 0 : _a.trim())) {
    errors.push("linked_account_number is required");
  }
  const count = Number(body.borrower_count);
  if (!count || count < 1 || count > 4) {
    errors.push("borrower_count must be between 1 and 4");
  }
  if (!Array.isArray(body.borrowers) || body.borrowers.length < count) {
    errors.push("borrowers array is incomplete");
  } else {
    body.borrowers.slice(0, count).forEach((b, i) => {
      var _a2, _b, _c;
      if (!((_a2 = b.surname) == null ? void 0 : _a2.trim())) errors.push(`borrowers[${i}].surname is required`);
      if (!((_b = b.given_names) == null ? void 0 : _b.trim())) errors.push(`borrowers[${i}].given_names is required`);
      if (!((_c = b.customer_number) == null ? void 0 : _c.trim())) errors.push(`borrowers[${i}].customer_number is required`);
    });
  }
  if (!Array.isArray(body.authorisations) || body.authorisations.length < count) {
    errors.push("authorisations array is incomplete");
  } else {
    body.authorisations.slice(0, count).forEach((a, i) => {
      if (!a.signed_date) errors.push(`authorisations[${i}].signed_date is required`);
      if (!a.signature_base64) errors.push(`authorisations[${i}].signature_base64 is required`);
    });
  }
  if (errors.length) {
    throw createError({ statusCode: 400, message: errors.join("; ") });
  }
  const linkedAccount = body.linked_account_number.trim();
  const borrowers = body.borrowers.slice(0, count);
  const authorisations = body.authorisations.slice(0, count);
  const id = createSubmission("open_offset", {
    borrower_count: count,
    borrowers,
    linked_account_number: linkedAccount,
    authorisations: authorisations.map((a) => ({
      signed_date: a.signed_date,
      // store only whether a sig was provided to avoid bloating JSON store
      has_signature: Boolean(a.signature_base64)
    }))
  });
  const names = borrowers.map((b) => `${b.given_names} ${b.surname}`).join(", ");
  const pdfBuffer = await buildPdf((doc) => {
    header(doc, "Open Offset Account", "Request to open and link an offset account to your home loan");
    borrowersTable(doc, borrowers);
    sectionTitle(doc, "Linked Account Details");
    labelValue(doc, "Linked Account Number", linkedAccount);
    sectionTitle(doc, "Customer Numbers");
    borrowers.forEach((b, i) => {
      labelValue(doc, `Borrower ${i + 1} \u2013 Customer Number`, b.customer_number);
    });
    authorisations.forEach((auth, i) => {
      signature(doc, borrowers[i], {
        signature_base64: auth.signature_base64,
        signed_date: auth.signed_date
        // omit home_contact and work_contact entirely
      });
    });
    pageFooter(doc, "Open Offset Account");
  });
  const subject = `Open Offset Account \u2013 ${names}`;
  const threadKey = linkedAccount;
  const replyToMessageId = getThreadMessageId("open_offset", threadKey);
  const body_text = [
    `Form: Open Offset Account`,
    `Submission ID: ${id}`,
    `Borrower(s): ${names}`,
    `Linked Account Number: ${linkedAccount}`,
    `Borrower Count: ${count}`,
    `Customer Numbers: ${borrowers.map((b, i) => `Borrower ${i + 1}: ${b.customer_number}`).join(", ")}`,
    `Submitted At: ${(/* @__PURE__ */ new Date()).toISOString()}`
  ].join("\n");
  const msgId = await sendSubmissionEmail({
    subject,
    body: body_text,
    pdfBuffer,
    pdfFilename: `open-offset-${id}.pdf`,
    replyToMessageId
  });
  saveThreadMessageId("open_offset", threadKey, msgId);
  return {
    id,
    status: "submitted",
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
});

export { submit_post as default };
//# sourceMappingURL=submit.post.mjs.map
