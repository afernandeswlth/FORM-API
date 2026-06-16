import { defineEventHandler, readBody, createError } from 'h3'
import {
  createSubmission,
  getThreadMessageId,
  saveThreadMessageId,
} from '~/server/utils/storage'
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
import type {
  ProductSwitchSubmission,
  LoanSwitch,
  Borrower,
  Authorisation,
} from '~/types'

// ── Validation helpers ────────────────────────────────────────────────────────

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

function isPositiveInt(v: unknown): boolean {
  return typeof v === 'number' && Number.isInteger(v) && v >= 1
}

function isPositiveNumber(v: unknown): boolean {
  return typeof v === 'number' && v > 0
}

function validateBody(body: unknown): ProductSwitchSubmission {
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, message: 'Invalid request body' })
  }

  const b = body as Record<string, unknown>

  // borrowers
  if (!Array.isArray(b.borrowers) || b.borrowers.length === 0) {
    throw createError({ statusCode: 400, message: 'At least one borrower is required' })
  }
  for (let i = 0; i < b.borrowers.length; i++) {
    const bor = b.borrowers[i] as Record<string, unknown>
    if (!isNonEmptyString(bor?.surname)) {
      throw createError({ statusCode: 400, message: `Borrower ${i + 1}: surname is required` })
    }
    if (!isNonEmptyString(bor?.given_names)) {
      throw createError({ statusCode: 400, message: `Borrower ${i + 1}: given_names is required` })
    }
  }

  // loan_switches
  if (!Array.isArray(b.loan_switches) || b.loan_switches.length === 0) {
    throw createError({ statusCode: 400, message: 'At least one loan switch is required' })
  }
  if (b.loan_switches.length > 3) {
    throw createError({ statusCode: 400, message: 'Maximum 3 loan switches allowed' })
  }
  for (let i = 0; i < b.loan_switches.length; i++) {
    const sw = b.loan_switches[i] as Record<string, unknown>
    if (!isNonEmptyString(sw?.loan_account_number)) {
      throw createError({ statusCode: 400, message: `Loan switch ${i + 1}: loan_account_number is required` })
    }
    if (!['principal_and_interest', 'interest_only'].includes(sw?.repayment_type as string)) {
      throw createError({ statusCode: 400, message: `Loan switch ${i + 1}: invalid repayment_type` })
    }
    if (sw.repayment_type === 'interest_only' && !isPositiveInt(sw?.interest_only_years)) {
      throw createError({ statusCode: 400, message: `Loan switch ${i + 1}: interest_only_years must be an integer >= 1` })
    }
    if (!['variable', 'fixed'].includes(sw?.rate_type as string)) {
      throw createError({ statusCode: 400, message: `Loan switch ${i + 1}: invalid rate_type` })
    }
    if (sw.rate_type === 'fixed') {
      if (!isPositiveNumber(sw?.fixed_rate_percent)) {
        throw createError({ statusCode: 400, message: `Loan switch ${i + 1}: fixed_rate_percent must be > 0` })
      }
      if (!isPositiveInt(sw?.fixed_period_years)) {
        throw createError({ statusCode: 400, message: `Loan switch ${i + 1}: fixed_period_years must be an integer >= 1` })
      }
    }
  }

  // authorisations
  if (
    !Array.isArray(b.authorisations) ||
    b.authorisations.length !== (b.borrowers as unknown[]).length
  ) {
    throw createError({ statusCode: 400, message: 'Authorisation count must match borrower count' })
  }
  for (let i = 0; i < b.authorisations.length; i++) {
    const auth = b.authorisations[i] as Record<string, unknown>
    if (!isNonEmptyString(auth?.signature_base64)) {
      throw createError({ statusCode: 400, message: `Authorisation ${i + 1}: signature is required` })
    }
    if (!isNonEmptyString(auth?.signed_date)) {
      throw createError({ statusCode: 400, message: `Authorisation ${i + 1}: signed_date is required` })
    }
  }

  return b as unknown as ProductSwitchSubmission
}

// ── PDF builder ───────────────────────────────────────────────────────────────

async function buildProductSwitchPdf(data: ProductSwitchSubmission): Promise<Buffer> {
  return buildPdf((doc) => {
    const names = data.borrowers.map(b => `${b.given_names} ${b.surname}`).join(', ')
    header(doc, 'Product Switch Request', `Submitted: ${new Date().toLocaleDateString('en-AU')}  |  Borrower(s): ${names}`)

    // Borrowers table
    borrowersTable(doc, data.borrowers)

    // Loan Switches
    sectionTitle(doc, 'Loan Switch Details')
    data.loan_switches.forEach((sw: LoanSwitch, i: number) => {
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#1a1a2e').text(`Loan Switch ${i + 1}`, { underline: false })
      doc.moveDown(0.2)
      labelValue(doc, 'Loan Account Number', sw.loan_account_number)
      labelValue(
        doc,
        'Repayment Type',
        sw.repayment_type === 'interest_only' ? 'Interest Only' : 'Principal & Interest'
      )
      if (sw.repayment_type === 'interest_only') {
        labelValue(doc, 'IO Term (Years)', String(sw.interest_only_years))
      }
      labelValue(
        doc,
        'Rate Type',
        sw.rate_type === 'fixed' ? 'Fixed' : 'Variable'
      )
      if (sw.rate_type === 'fixed') {
        labelValue(doc, 'Fixed Rate (%)', String(sw.fixed_rate_percent))
        labelValue(doc, 'Fixed Period (Years)', String(sw.fixed_period_years))
      }
      doc.moveDown(0.5)
    })

    // Reason for request
    if (data.reason_for_request) {
      sectionTitle(doc, 'Reason for Request')
      doc.font('Helvetica').fontSize(9).fillColor('#000000').text(data.reason_for_request)
      doc.moveDown(0.8)
    }

    // Authorisations
    data.borrowers.forEach((borrower: Borrower, i: number) => {
      const auth = data.authorisations[i] as Authorisation
      signature(doc, borrower, {
        signature_base64: auth.signature_base64,
        signed_date: auth.signed_date,
        home_contact: auth.home_contact,
        work_contact: auth.work_contact,
      }, i)
    })

    pageFooter(doc, 'Product Switch Request')
  })
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default defineEventHandler(async (event) => {
  const rawBody = await readBody(event)
  const data = validateBody(rawBody)

  // Persist submission
  const id = createSubmission('product_switch', data)

  // Build names string for subject line
  const names = data.borrowers
    .map((b: Borrower) => `${b.given_names} ${b.surname}`)
    .join(' & ')

  const subject = `Product Switch Request – ${names}`

  // Thread key: first loan account number
  const threadKey = data.loan_switches[0].loan_account_number.trim()
  const existingMessageId = getThreadMessageId('product_switch', threadKey)

  // Build PDF
  const pdfBuffer = await buildProductSwitchPdf(data)

  const loanList = data.loan_switches
    .map((sw: LoanSwitch, i: number) => {
      const parts = [`  Loan ${i + 1}: ${sw.loan_account_number}`]
      parts.push(`    Repayment: ${sw.repayment_type === 'interest_only' ? `Interest Only (${sw.interest_only_years}yr)` : 'Principal & Interest'}`)
      parts.push(`    Rate: ${sw.rate_type === 'fixed' ? `Fixed ${sw.fixed_rate_percent}% for ${sw.fixed_period_years}yr` : 'Variable'}`)
      return parts.join('\n')
    })
    .join('\n')

  const emailBody = [
    `Product Switch Request`,
    `Submitted: ${new Date().toISOString()}`,
    `Reference: ${id}`,
    ``,
    `Borrower(s): ${names}`,
    ``,
    `Loan Switches:`,
    loanList,
    data.reason_for_request ? `\nReason for Request:\n${data.reason_for_request}` : '',
    ``,
    `Please see the attached PDF for full details and signatures.`,
  ]
    .filter(line => line !== undefined)
    .join('\n')

  // Send email
  const sentMessageId = await sendSubmissionEmail({
    subject,
    body: emailBody,
    pdfBuffer,
    pdfFilename: `product-switch-${id}.pdf`,
    replyToMessageId: existingMessageId,
  })

  // Persist thread message ID (only stores if not already present)
  saveThreadMessageId('product_switch', threadKey, sentMessageId)

  const created_at = new Date().toISOString()

  return { id, status: 'submitted', created_at }
})
