import { createSubmission, getThreadMessageId, saveThreadMessageId } from '~/server/utils/storage'
import { sendSubmissionEmail } from '~/server/utils/email'
import { buildPdf, header, sectionTitle, borrowersTable, labelValue, signature, pageFooter } from '~/server/utils/pdf'

interface BorrowerIn {
  surname: string
  given_names: string
  customer_number: string
}

interface AuthorisationIn {
  signed_date: string
  signature_base64: string
}

interface OpenOffsetBody {
  borrower_count: number
  borrowers: BorrowerIn[]
  linked_account_number: string
  authorisations: AuthorisationIn[]
}

export default defineEventHandler(async (event) => {
  const body = await readBody<OpenOffsetBody>(event)

  // ── Validate ──────────────────────────────────────────────────────────────
  const errors: string[] = []

  if (!body.linked_account_number?.trim()) {
    errors.push('linked_account_number is required')
  }

  const count = Number(body.borrower_count)
  if (!count || count < 1 || count > 4) {
    errors.push('borrower_count must be between 1 and 4')
  }

  if (!Array.isArray(body.borrowers) || body.borrowers.length < count) {
    errors.push('borrowers array is incomplete')
  } else {
    body.borrowers.slice(0, count).forEach((b, i) => {
      if (!b.surname?.trim())        errors.push(`borrowers[${i}].surname is required`)
      if (!b.given_names?.trim())    errors.push(`borrowers[${i}].given_names is required`)
      if (!b.customer_number?.trim()) errors.push(`borrowers[${i}].customer_number is required`)
    })
  }

  if (!Array.isArray(body.authorisations) || body.authorisations.length < count) {
    errors.push('authorisations array is incomplete')
  } else {
    body.authorisations.slice(0, count).forEach((a, i) => {
      if (!a.signed_date)        errors.push(`authorisations[${i}].signed_date is required`)
      if (!a.signature_base64)   errors.push(`authorisations[${i}].signature_base64 is required`)
    })
  }

  if (errors.length) {
    throw createError({ statusCode: 400, message: errors.join('; ') })
  }

  // ── Normalise ─────────────────────────────────────────────────────────────
  const linkedAccount = body.linked_account_number.trim()
  const borrowers = body.borrowers.slice(0, count)
  const authorisations = body.authorisations.slice(0, count)

  // ── Persist ───────────────────────────────────────────────────────────────
  const id = createSubmission('open_offset', {
    borrower_count: count,
    borrowers,
    linked_account_number: linkedAccount,
    authorisations: authorisations.map(a => ({
      signed_date: a.signed_date,
      // store only whether a sig was provided to avoid bloating JSON store
      has_signature: Boolean(a.signature_base64),
    })),
  })

  // ── Build PDF ─────────────────────────────────────────────────────────────
  const names = borrowers.map(b => `${b.given_names} ${b.surname}`).join(', ')

  const pdfBuffer = await buildPdf((doc) => {
    header(doc, 'Open Offset Account', 'Request to open and link an offset account to your home loan')

    // Borrowers table (surname + given_names shown)
    borrowersTable(doc, borrowers)

    // Linked account
    sectionTitle(doc, 'Linked Account Details')
    labelValue(doc, 'Linked Account Number', linkedAccount)

    // Customer numbers per borrower
    sectionTitle(doc, 'Customer Numbers')
    borrowers.forEach((b, i) => {
      labelValue(doc, `Borrower ${i + 1} – Customer Number`, b.customer_number)
    })

    // Authorisations – no home_contact/work_contact for this form
    authorisations.forEach((auth, i) => {
      signature(doc, borrowers[i], {
        signature_base64: auth.signature_base64,
        signed_date: auth.signed_date,
        // omit home_contact and work_contact entirely
      }, i)
    })

    pageFooter(doc, 'Open Offset Account')
  })

  // ── Email ─────────────────────────────────────────────────────────────────
  const subject = `Open Offset Account – ${names}`
  const threadKey = linkedAccount

  const replyToMessageId = getThreadMessageId('open_offset', threadKey)

  const body_text = [
    `Form: Open Offset Account`,
    `Submission ID: ${id}`,
    `Borrower(s): ${names}`,
    `Linked Account Number: ${linkedAccount}`,
    `Borrower Count: ${count}`,
    `Customer Numbers: ${borrowers.map((b, i) => `Borrower ${i + 1}: ${b.customer_number}`).join(', ')}`,
    `Submitted At: ${new Date().toISOString()}`,
  ].join('\n')

  const msgId = await sendSubmissionEmail({
    subject,
    body: body_text,
    pdfBuffer,
    pdfFilename: `open-offset-${id}.pdf`,
    replyToMessageId,
  })

  saveThreadMessageId('open_offset', threadKey, msgId)

  // ── Response ──────────────────────────────────────────────────────────────
  return {
    id,
    status: 'submitted',
    created_at: new Date().toISOString(),
  }
})
