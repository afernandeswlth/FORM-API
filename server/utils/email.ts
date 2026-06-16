import nodemailer from 'nodemailer'
import { randomUUID } from 'crypto'

const TO_ADDR = 'a.fernandes@wlth.com'

function transporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'smtp.office365.com',
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendSubmissionEmail(opts: {
  subject: string
  body: string
  pdfBuffer: Buffer
  pdfFilename: string
  replyToMessageId?: string | null
}): Promise<string> {
  const from = process.env.FROM_EMAIL ?? process.env.SMTP_USER ?? ''
  const domain = from.includes('@') ? from.split('@')[1] : 'wlth.com'
  const messageId = `<${randomUUID()}@${domain}>`

  const headers: Record<string, string> = { 'Message-ID': messageId }
  if (opts.replyToMessageId) {
    headers['In-Reply-To'] = opts.replyToMessageId
    headers['References'] = opts.replyToMessageId
  }

  await transporter().sendMail({
    from: `"${process.env.FROM_NAME ?? 'WLTH Forms'}" <${from}>`,
    to: TO_ADDR,
    subject: opts.replyToMessageId ? `Re: ${opts.subject}` : opts.subject,
    text: opts.body,
    headers,
    attachments: [{
      filename: opts.pdfFilename,
      content: opts.pdfBuffer,
      contentType: 'application/pdf',
    }],
  })

  return messageId
}
