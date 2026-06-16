import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';

const DATA_DIR = process.env.VERCEL ? "/tmp/wlth" : join(process.cwd(), "data");
function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}
function storeFile(formType) {
  const dir = join(DATA_DIR, formType);
  ensureDir(dir);
  return join(dir, "submissions.json");
}
function threadFile(formType) {
  ensureDir(DATA_DIR);
  return join(DATA_DIR, `${formType}_threads.json`);
}
function createSubmission(formType, data) {
  const file = storeFile(formType);
  const store = existsSync(file) ? JSON.parse(readFileSync(file, "utf-8")) : {};
  const id = randomUUID();
  store[id] = { id, created_at: (/* @__PURE__ */ new Date()).toISOString(), status: "submitted", data };
  writeFileSync(file, JSON.stringify(store, null, 2));
  return id;
}
function getThreadMessageId(formType, loanNo) {
  var _a;
  const file = threadFile(formType);
  if (!existsSync(file)) return null;
  const threads = JSON.parse(readFileSync(file, "utf-8"));
  return (_a = threads[loanNo]) != null ? _a : null;
}
function saveThreadMessageId(formType, loanNo, msgId) {
  const file = threadFile(formType);
  const threads = existsSync(file) ? JSON.parse(readFileSync(file, "utf-8")) : {};
  if (!(loanNo in threads)) {
    threads[loanNo] = msgId;
    writeFileSync(file, JSON.stringify(threads, null, 2));
  }
}

const TO_ADDR = "a.fernandes@wlth.com";
function transporter() {
  var _a, _b;
  return nodemailer.createTransport({
    host: (_a = process.env.SMTP_HOST) != null ? _a : "smtp.office365.com",
    port: Number((_b = process.env.SMTP_PORT) != null ? _b : 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}
async function sendSubmissionEmail(opts) {
  var _a, _b, _c;
  const from = (_b = (_a = process.env.FROM_EMAIL) != null ? _a : process.env.SMTP_USER) != null ? _b : "";
  const domain = from.includes("@") ? from.split("@")[1] : "wlth.com";
  const messageId = `<${randomUUID()}@${domain}>`;
  const headers = { "Message-ID": messageId };
  if (opts.replyToMessageId) {
    headers["In-Reply-To"] = opts.replyToMessageId;
    headers["References"] = opts.replyToMessageId;
  }
  await transporter().sendMail({
    from: `"${(_c = process.env.FROM_NAME) != null ? _c : "WLTH Forms"}" <${from}>`,
    to: TO_ADDR,
    subject: opts.replyToMessageId ? `Re: ${opts.subject}` : opts.subject,
    text: opts.body,
    headers,
    attachments: [{
      filename: opts.pdfFilename,
      content: opts.pdfBuffer,
      contentType: "application/pdf"
    }]
  });
  return messageId;
}

const DARK = "#1a1a2e";
const GREY = "#555555";
const LGREY = "#f7f7f7";
const BORD = "#d0d0d0";
function buildPdf(drawFn) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    drawFn(doc);
    doc.end();
  });
}
function header(doc, title, subtitle) {
  doc.font("Helvetica-Bold").fontSize(20).fillColor(DARK).text("WLTH", 50, 50);
  doc.moveTo(50, 76).lineTo(545, 76).strokeColor(DARK).lineWidth(1).stroke();
  doc.font("Helvetica-Bold").fontSize(15).fillColor(DARK).text(title, 50, 84);
  doc.font("Helvetica-Oblique").fontSize(9).fillColor(GREY).text(subtitle, 50, 104);
  doc.y = 122;
}
function sectionTitle(doc, text) {
  doc.moveDown(0.5);
  doc.font("Helvetica-Bold").fontSize(11).fillColor(DARK).text(text);
  doc.moveDown(0.3);
}
function labelValue(doc, label, value) {
  const x = doc.x;
  doc.font("Helvetica").fontSize(8).fillColor(GREY).text(label, x, doc.y, { continued: false });
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#000000").text(value != null ? value : "\u2014");
  doc.moveTo(x, doc.y).lineTo(x + 495, doc.y).strokeColor(BORD).lineWidth(0.3).stroke();
  doc.moveDown(0.5);
}
function borrowersTable(doc, borrowers) {
  sectionTitle(doc, "Borrower(s)");
  const startY = doc.y;
  const colW = [60, 120, 140];
  const headers = ["", "Surname", "Given Name(s)"];
  const rowH = 18;
  doc.rect(50, startY, 320, rowH).fill(LGREY);
  headers.forEach((h, i) => {
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor(DARK).text(h, 50 + colW.slice(0, i).reduce((a, b) => a + b, 0), startY + 4, { width: colW[i] });
  });
  borrowers.forEach((b, idx) => {
    const rowY = startY + rowH * (idx + 1);
    const cells = [`Borrower ${idx + 1}`, b.surname, b.given_names];
    cells.forEach((cell, i) => {
      doc.font("Helvetica").fontSize(8.5).fillColor("#000000").text(cell, 50 + colW.slice(0, i).reduce((a, b2) => a + b2, 0), rowY + 4, { width: colW[i] });
    });
    doc.rect(50, rowY, 320, rowH).strokeColor(BORD).lineWidth(0.3).stroke();
  });
  doc.rect(50, startY, 320, rowH * (borrowers.length + 1)).strokeColor(BORD).lineWidth(0.3).stroke();
  doc.y = startY + rowH * (borrowers.length + 1) + 10;
}
function signature(doc, borrower, auth, idx) {
  sectionTitle(doc, `Customer Authorisation \u2013 ${borrower.given_names} ${borrower.surname}`);
  doc.font("Helvetica").fontSize(8).fillColor(GREY).text("Signature");
  try {
    const raw = auth.signature_base64.includes(",") ? auth.signature_base64.split(",")[1] : auth.signature_base64;
    const buf = Buffer.from(raw, "base64");
    doc.image(buf, doc.x, doc.y, { width: 160, height: 52 });
    doc.y += 58;
  } catch {
    doc.font("Helvetica").fontSize(8).fillColor(GREY).text("[Signature not available]");
  }
  const rowY = doc.y;
  if (auth.home_contact !== void 0) {
    doc.font("Helvetica").fontSize(8).fillColor(GREY).text("Home Contact", 50, rowY);
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#000000").text(auth.home_contact || "\u2014", 50, rowY + 10);
    doc.font("Helvetica").fontSize(8).fillColor(GREY).text("Work Contact", 210, rowY);
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#000000").text(auth.work_contact || "\u2014", 210, rowY + 10);
    doc.font("Helvetica").fontSize(8).fillColor(GREY).text("Date", 370, rowY);
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#000000").text(auth.signed_date, 370, rowY + 10);
    doc.y = rowY + 28;
  } else {
    doc.font("Helvetica").fontSize(8).fillColor(GREY).text("Date", 50, rowY);
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#000000").text(auth.signed_date, 50, rowY + 10);
    doc.y = rowY + 28;
  }
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor(BORD).lineWidth(0.3).stroke();
  doc.moveDown(0.8);
}
function pageFooter(doc, formName) {
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    doc.font("Helvetica").fontSize(7).fillColor(GREY).text(
      `WLTH-V1.1  |  ${formName}  |  Australian Credit Licence 525752`,
      50,
      810,
      { align: "center", width: 495 }
    );
  }
}

export { saveThreadMessageId as a, buildPdf as b, createSubmission as c, borrowersTable as d, sectionTitle as e, signature as f, getThreadMessageId as g, header as h, labelValue as l, pageFooter as p, sendSubmissionEmail as s };
//# sourceMappingURL=pdf.mjs.map
