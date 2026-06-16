import { defineEventHandler, readBody, createError } from 'h3'
import { createSubmission, getThreadMessageId, saveThreadMessageId } from '~/server/utils/storage'
import { sendSubmissionEmail } from '~/server/utils/email'
import {
  buildPdf,
  header,
  sectionTitle,
  borrowersTable,
  labelValue,
  signature,
  pageFooter,
} from '~/server/utils/pdf'
import type { RepaymentChangeSubmission } from '~/types'

const FORM_TYPE = 'repayment_change'
const FORM_NAME = 'Repayment Change Request'

export default defineEventHandler(async (event) => {
  const body = await readBody<RepaymentChangeSubmission>(event)

  // ── Validate ──────────────────────────────────────────────────────────────

  if (!body.borrowers?.length) {
    throw createError({ statusCode: 400, message: 'At least one borrower is required.' })
  }

  for (const b of body.borrowers) {
    if (!b.surname?.trim() || !b.given_names?.trim()) {
      throw createError({ statusCode: 400, message: 'Borrower surname and given name(s) are required.' })
    }
  }

  if (!body.repayment_changes?.length) {
    throw createError({ statusCode: 400, message: 'At least one repayment change is required.' })
  }

  for (const c of body.repayment_changes) {
    if (!c.loan_account_number?.trim()) {
      throw createError({ statusCode: 400, message: 'Loan account number is required for each change.' })
    }
    if (!(c.new_amount > 0)) {
      throw createError({ statusCode: 400, message: 'New repayment amount must be greater than zero.' })
    }
    if (!['weekly', 'fortnightly', 'monthly'].includes(c.frequency)) {
      throw createError({ statusCode: 400, message: 'Payment frequency must be weekly, fortnightly, or monthly.' })
    }
  }

  if (body.authorisations?.length !== body.borrowers.length) {
    throw createError({ statusCode: 400, message: 'An authorisation is required for each borrower.' })
  }

  for (const auth of body.authorisations) {
    if (!auth.signature_base64?.trim()) {
      throw createError({ statusCode: 400, message: 'Signature is required for each borrower.' })
    }
    if (!auth.signed_date?.trim()) {
      throw createError({ statusCode: 400, message: 'Date is required for each borrower authorisation.' })
    }
  }

  // ── Persist submission ────────────────────────────────────────────────────

  const id         = createSubmission(FORM_TYPE, body)
  const created_at = new Date().toISOString()

  // ── Build PDF ─────────────────────────────────────────────────────────────

  const names = body.borrowers.map(b => `${b.given_names} ${b.surname}`).join(' & ')
  const primaryLoan = body.repayment_changes[0].loan_account_number

  const pdfBuffer = await buildPdf((doc) => {
    header(doc, FORM_NAME, `Submission ID: ${id}  |  ${created_at}`)

    borrowersTable(doc, body.borrowers)

    sectionTitle(doc, 'Repayment Changes')

    body.repayment_changes.forEach((change, i) => {
      const freq = change.frequency.charAt(0).toUpperCase() + change.frequency.slice(1)
      labelValue(doc, `Change ${i + 1} – Loan Account`, change.loan_account_number)
      labelValue(doc, 'New Repayment Amount', `$${change.new_amount.toFixed(2)}`)
      labelValue(doc, 'Payment Frequency', freq)
      doc.moveDown(0.3)
    })

    if (body.comments?.trim()) {
      sectionTitle(doc, 'Additional Comments')
      labelValue(doc, 'Comments', body.comments.trim())
    }

    body.borrowers.forEach((borrower, i) => {
      signature(doc, borrower, body.authorisations[i], i)
    })

    pageFooter(doc, FORM_NAME)
  })

  // ── Email ─────────────────────────────────────────────────────────────────

  const subject        = `Repayment Change – ${names}`
  const replyToMsgId   = getThreadMessageId(FORM_TYPE, primaryLoan)

  const body_text = [
    `Form: ${FORM_NAME}`,
    `Submission ID: ${id}`,
    `Date: ${created_at}`,
    '',
    `Borrower(s): ${names}`,
    '',
    'Repayment Changes:',
    ...body.repayment_changes.map((c, i) => {
      const freq = c.frequency.charAt(0).toUpperCase() + c.frequency.slice(1)
      return `  ${i + 1}. Loan: ${c.loan_account_number} | Amount: $${c.new_amount.toFixed(2)} | Frequency: ${freq}`
    }),
    '',
    body.comments?.trim() ? `Comments: ${body.comments.trim()}` : '',
  ].filter(l => l !== undefined).join('\n')

  const messageId = await sendSubmissionEmail({
    subject,
    body:          body_text,
    pdfBuffer,
    pdfFilename:   `repayment-change-${id}.pdf`,
    replyToMessageId: replyToMsgId,
  })

  saveThreadMessageId(FORM_TYPE, primaryLoan, messageId)

  // ── Response ──────────────────────────────────────────────────────────────

  return {
    id,
    status:     'submitted',
    created_at,
  }
})
