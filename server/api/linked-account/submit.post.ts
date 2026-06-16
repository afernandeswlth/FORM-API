import { defineEventHandler, readBody, createError } from 'h3'
import { createSubmission, getThreadMessageId, saveThreadMessageId } from '~/server/utils/storage'
import { sendSubmissionEmail } from '~/server/utils/email'
import { buildPdf, header, sectionTitle, borrowersTable, labelValue, signature, pageFooter } from '~/server/utils/pdf'

interface LinkedAccountPayload {
  loan_account_number: string
  borrowers: Array<{
    surname: string
    given_names: string
  }>
  linked_accounts: Array<{
    bank_name: string
    account_name: string
    bsb: string
    account_number: string
    bank_statement_data: string | null
    bank_statement_filename: string | null
  }>
  authorisations: Array<{
    home_contact?: string
    work_contact?: string
    signed_date: string
    signature_base64: string | null
  }>
}

export default defineEventHandler(async (event) => {
  const body = await readBody<LinkedAccountPayload>(event)

  // ---- Validation ----
  if (!body?.loan_account_number?.trim()) {
    throw createError({ statusCode: 422, statusMessage: 'Loan account number is required.' })
  }

  if (!Array.isArray(body.borrowers) || body.borrowers.length === 0) {
    throw createError({ statusCode: 422, statusMessage: 'At least one borrower is required.' })
  }

  for (let i = 0; i < body.borrowers.length; i++) {
    const b = body.borrowers[i]
    if (!b?.surname?.trim() || !b?.given_names?.trim()) {
      throw createError({ statusCode: 422, statusMessage: `Borrower ${i + 1}: surname and given names are required.` })
    }
  }

  if (!Array.isArray(body.linked_accounts) || body.linked_accounts.length === 0) {
    throw createError({ statusCode: 422, statusMessage: 'At least one linked account is required.' })
  }

  for (let i = 0; i < body.linked_accounts.length; i++) {
    const acc = body.linked_accounts[i]
    if (!acc?.bank_name?.trim()) {
      throw createError({ statusCode: 422, statusMessage: `Account ${i + 1}: bank name is required.` })
    }
    if (!acc?.account_name?.trim()) {
      throw createError({ statusCode: 422, statusMessage: `Account ${i + 1}: account name is required.` })
    }
    if (!/^\d{3}-\d{3}$/.test(acc?.bsb ?? '')) {
      throw createError({ statusCode: 422, statusMessage: `Account ${i + 1}: BSB must be in format 000-000.` })
    }
    if (!acc?.account_number?.trim()) {
      throw createError({ statusCode: 422, statusMessage: `Account ${i + 1}: account number is required.` })
    }
    if (!acc?.bank_statement_data) {
      throw createError({ statusCode: 422, statusMessage: `Account ${i + 1}: bank statement is required.` })
    }
  }

  if (!Array.isArray(body.authorisations) || body.authorisations.length !== body.borrowers.length) {
    throw createError({ statusCode: 422, statusMessage: 'Authorisations must match number of borrowers.' })
  }

  for (let i = 0; i < body.authorisations.length; i++) {
    const auth = body.authorisations[i]
    if (!auth?.signed_date) {
      throw createError({ statusCode: 422, statusMessage: `Borrower ${i + 1} authorisation: date is required.` })
    }
    if (!auth?.signature_base64) {
      throw createError({ statusCode: 422, statusMessage: `Borrower ${i + 1} authorisation: signature is required.` })
    }
  }

  // ---- Store submission ----
  const id = createSubmission('linked-account', body)
  const createdAt = new Date().toISOString()
  const loanNo = body.loan_account_number.trim()

  // ---- Generate PDF ----
  const borrowerNames = body.borrowers
    .map(b => `${b.given_names} ${b.surname}`)
    .join(', ')

  const pdfBuffer = await buildPdf((doc) => {
    header(doc, 'Linked Account Nomination', `Submitted: ${new Date(createdAt).toLocaleDateString('en-AU', { day: '2-digit', month: 'long', year: 'numeric' })}`)

    // Borrowers table
    borrowersTable(doc, body.borrowers)

    // Loan account number
    sectionTitle(doc, 'Loan Details')
    labelValue(doc, 'Loan Account Number', loanNo)

    // Linked accounts
    sectionTitle(doc, 'Linked Bank Accounts')
    body.linked_accounts.forEach((acc, i) => {
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#1a1a2e').text(`Account ${i + 1}`, { underline: false })
      doc.moveDown(0.2)
      labelValue(doc, 'Bank Name', acc.bank_name)
      labelValue(doc, 'Account Name', acc.account_name)
      labelValue(doc, 'BSB', acc.bsb)
      labelValue(doc, 'Account Number', acc.account_number)
      if (acc.bank_statement_filename) {
        labelValue(doc, 'Bank Statement', acc.bank_statement_filename)
      }
      doc.moveDown(0.4)
    })

    // Authorisation signatures
    body.authorisations.forEach((auth, i) => {
      signature(doc, body.borrowers[i], {
        signature_base64: auth.signature_base64 ?? '',
        signed_date: auth.signed_date,
        home_contact: auth.home_contact ?? '',
        work_contact: auth.work_contact ?? '',
      }, i)
    })

    pageFooter(doc, 'Linked Account Nomination')
  })

  // ---- Email thread tracking ----
  const existingThreadId = getThreadMessageId('linked-account', loanNo)

  // Build email body
  const accountLines = body.linked_accounts
    .map((acc, i) =>
      `  Account ${i + 1}:\n` +
      `    Bank:       ${acc.bank_name}\n` +
      `    Name:       ${acc.account_name}\n` +
      `    BSB:        ${acc.bsb}\n` +
      `    Number:     ${acc.account_number}\n` +
      `    Statement:  ${acc.bank_statement_filename ?? 'attached as data URI'}`
    )
    .join('\n\n')

  const emailBody = [
    `Linked Account Nomination`,
    ``,
    `Loan Account Number: ${loanNo}`,
    `Borrower(s): ${borrowerNames}`,
    `Submission ID: ${id}`,
    `Submitted: ${new Date(createdAt).toLocaleString('en-AU')}`,
    ``,
    `Linked Accounts:`,
    accountLines,
  ].join('\n')

  const subject = `Linked Account Nomination – ${borrowerNames}`

  const messageId = await sendSubmissionEmail({
    subject,
    body: emailBody,
    pdfBuffer,
    pdfFilename: `linked-account-${id}.pdf`,
    replyToMessageId: existingThreadId,
  })

  saveThreadMessageId('linked-account', loanNo, messageId)

  return {
    id,
    status: 'submitted',
    created_at: createdAt,
  }
})
