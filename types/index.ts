export interface Borrower {
  surname: string
  given_names: string
}

export interface Authorisation {
  signature_base64: string
  signed_date: string
  home_contact?: string
  work_contact?: string
}

// Linked Account
export interface LinkedAccount {
  bank_name: string
  account_name: string
  bsb: string
  account_number: string
  bank_statement_base64: string
  bank_statement_filename: string
}
export interface LinkedAccountSubmission {
  borrowers: Borrower[]
  loan_account_number: string
  linked_accounts: LinkedAccount[]
  authorisations: Authorisation[]
}

// Direct Debit
export type PaymentFrequency = 'weekly' | 'fortnightly' | 'monthly'
export type AmountType = 'minimum' | 'fixed' | 'other'
export interface DirectDebitAccount {
  bank_name: string
  account_name: string
  bsb: string
  account_number: string
  payment_frequency: PaymentFrequency
  amount_type: AmountType
  fixed_amount?: number
  bank_statement_base64: string
  bank_statement_filename: string
}
export interface DirectDebitSubmission {
  borrowers: Borrower[]
  loan_account_number: string
  accounts: DirectDebitAccount[]
  authorisations: Authorisation[]
}

// Repayment Change
export interface RepaymentChange {
  loan_account_number: string
  new_amount: number
  frequency: PaymentFrequency
}
export interface RepaymentChangeSubmission {
  borrowers: Borrower[]
  repayment_changes: RepaymentChange[]
  comments?: string
  authorisations: Authorisation[]
}

// Open Offset
export interface OpenOffsetSubmission {
  borrowers: Array<Borrower & { customer_number: string }>
  linked_account_number: string
  authorisations: Authorisation[]
}

// Product Switch
export type RepaymentType = 'principal_and_interest' | 'interest_only'
export type RateType = 'variable' | 'fixed'
export interface LoanSwitch {
  loan_account_number: string
  repayment_type: RepaymentType
  interest_only_years?: number
  rate_type: RateType
  fixed_rate_percent?: number
  fixed_period_years?: number
}
export interface ProductSwitchSubmission {
  borrowers: Borrower[]
  loan_switches: LoanSwitch[]
  reason_for_request?: string
  authorisations: Authorisation[]
}

// Redraw
export interface RedrawDestination {
  to_account_name: string
  bsb: string
  account_number: string
  redraw_amount: number
  large_amount: boolean
}
export interface RedrawSubmission {
  borrowers: Borrower[]
  loan_account_number: string
  redraw_destination: RedrawDestination
  redraw_reason: string
  authorisations: Array<{ signature_base64: string; signed_date: string }>
}

// API response
export interface SubmissionResponse {
  id: string
  status: string
  created_at: string
}
