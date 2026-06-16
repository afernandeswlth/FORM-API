import { createSubmission, getThreadMessageId, saveThreadMessageId } from '~/server/utils/storage'
import { sendSubmissionEmail } from '~/server/utils/email'
import { buildPdf, header, sectionTitle, borrowersTable, labelValue, signature, pageFooter } from '~/server/utils/pdf'
import type { RedrawSubmission } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<RedrawSubmission>(event)

  // --- Basic validation ---
  if (!body.borrowers?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Borrowers are required' })
  }
  for (const b of body.borrowers) {
    if (!b.surname?.trim() || !b.given_names?.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'All borrower fields are required' })
    }
  }
  if (!body.loan_account_number?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Loan account number is required' })
  }
  const dest = body.redraw_destination
  if (!dest?.to_account_name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'To Account Name is required' })
  }
  if (!/^\d{3}-\d{3}$/.test(dest.bsb ?? '')) {
    throw createError({ statusCode: 400, statusMessage: 'BSB must be in format 000-000' })
  }
  if (!/^\d+$/.test(dest.account_number ?? '')) {
    throw createError({ statusCode: 400, statusMessage: 'Account number must be digits only' })
  }
  if (!dest.redraw_amount || dest.redraw_amount <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Redraw amount must be greater than $0' })
  }
  if (!body.redraw_reason?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Redraw reason is required' })
  }
  if (!body.authorisations?.length || body.authorisations.length !== body.borrowers.length) {
    throw createError({ statusCode: 400, statusMessage: 'Authorisation required for each borrower' })
  }
  for (const auth of body.authorisations) {
    if (!auth.signed_date) {
      throw createError({ statusCode: 400, statusMessage: 'Signed date required for each borrower' })
    }
    if (!auth.signature_base64) {
      throw createError({ statusCode: 400, statusMessage: 'Signature required for each borrower' })
    }
  }

  // --- Persist submission ---
  const id = createSubmission('redraw', body)
  const loanNo = body.loan_account_number.trim()

  // --- Names for subject line ---
  const names = body.borrowers.map(b => `${b.given_names} ${b.surname}`).join(' & ')
  const subject = `Redraw Request – ${names}`

  // --- Build body text ---
  const amountFormatted = dest.redraw_amount.toLocaleString('en-AU', {
    style: 'currency',
    currency: 'AUD',
  })
  const largeAmountNote = dest.redraw_amount >= 100000
    ? '\n*** NOTE: Amount is $100,000 or more — WLTH approval required ***\n'
    : ''

  const borrowerLines = body.borrowers
    .map((b, i) => `  Borrower ${i + 1}: ${b.given_names} ${b.surname}`)
    .join('\n')

  const emailBody = [
    `Redraw Request – ${names}`,
    `Submission ID: ${id}`,
    '',
    'BORROWERS',
    borrowerLines,
    '',
    'LOAN DETAILS',
    `  Loan Account Number: ${loanNo}`,
    '',
    'REDRAW DESTINATION',
    `  To Account Name: ${dest.to_account_name}`,
    `  BSB: ${dest.bsb}`,
    `  Account Number: ${dest.account_number}`,
    `  Redraw Amount: ${amountFormatted}`,
    largeAmountNote,
    'REDRAW REASON',
    `  ${body.redraw_reason}`,
    '',
    'AUTHORISATIONS',
    ...body.authorisations.map((a, i) =>
      `  Borrower ${i + 1} – ${body.borrowers[i].given_names} ${body.borrowers[i].surname}: signed ${a.signed_date}`
    ),
  ].join('\n')

  // --- Build PDF ---
  const pdfBuffer = await buildPdf((doc) => {
    header(doc, 'Redraw Request', `Loan Account: ${loanNo}  |  Submitted: ${new Date().toLocaleDateString('en-AU')}`)

    borrowersTable(doc, body.borrowers)

    sectionTitle(doc, 'Loan Details')
    labelValue(doc, 'Loan Account Number', loanNo)

    sectionTitle(doc, 'Redraw Destination')
    labelValue(doc, 'To Account Name', dest.to_account_name)
    labelValue(doc, 'BSB', dest.bsb)
    labelValue(doc, 'Account Number', dest.account_number)
    labelValue(doc, 'Redraw Amount', amountFormatted)

    if (dest.redraw_amount >= 100000) {
      doc.moveDown(0.3)
      const bannerY = doc.y
      doc.rect(50, bannerY, 495, 22).fill('#fff8e1')
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#7c5200')
        .text('APPROVAL REQUIRED: Amounts of $100,000 or more require WLTH approval.', 56, bannerY + 5, { width: 483 })
      doc.y = bannerY + 30
    }

    sectionTitle(doc, 'Redraw Reason')
    doc.font('Helvetica').fontSize(9).fillColor('#000000').text(body.redraw_reason)
    doc.moveDown(0.6)

    for (let i = 0; i < body.borrowers.length; i++) {
      signature(doc, body.borrowers[i], {
        signature_base64: body.authorisations[i].signature_base64,
        signed_date: body.authorisations[i].signed_date,
      }, i)
    }

    pageFooter(doc, 'Redraw Request')
  })

  // --- Email threading ---
  const existingThreadId = getThreadMessageId('redraw', loanNo)

  const messageId = await sendSubmissionEmail({
    subject,
    body: emailBody,
    pdfBuffer,
    pdfFilename: `redraw-request-${loanNo}-${id.slice(0, 8)}.pdf`,
    replyToMessageId: existingThreadId,
  })

  saveThreadMessageId('redraw', loanNo, messageId)

  return {
    id,
    status: 'submitted',
    created_at: new Date().toISOString(),
  }
})
