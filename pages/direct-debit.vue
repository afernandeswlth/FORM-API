<template>
  <div>
    <AppHeader title="Direct Debit Request" />

    <SuccessOverlay v-if="submitted" :ref-id="submissionId" @reset="reset" />

    <div class="container">

      <!-- Borrower Count -->
      <div class="card">
        <div class="card-title">Number of Borrowers</div>
        <div class="borrower-selector">
          <label
            v-for="n in 4"
            :key="n"
            :class="{ active: borrowerCount === n }"
            @click="setBorrowerCount(n)"
          >
            <input type="radio" name="borrower-count" :value="n" :checked="borrowerCount === n" />
            {{ n }}
          </label>
        </div>
      </div>

      <!-- Borrower Details -->
      <div class="card">
        <div class="card-title">Borrower Details</div>
        <div v-for="(b, i) in borrowers" :key="i">
          <div class="borrower-heading">Borrower {{ i + 1 }}</div>
          <div class="field-row">
            <div class="field" :class="{ 'has-error': showErrors && !b.surname.trim() }">
              <label>Surname *</label>
              <input v-model="b.surname" type="text" placeholder="Smith" />
              <div v-if="showErrors && !b.surname.trim()" class="err-msg">Required</div>
            </div>
            <div class="field" :class="{ 'has-error': showErrors && !b.given_names.trim() }">
              <label>Given Names *</label>
              <input v-model="b.given_names" type="text" placeholder="Jane" />
              <div v-if="showErrors && !b.given_names.trim()" class="err-msg">Required</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loan Account Number -->
      <div class="card">
        <div class="card-title">Loan Details</div>
        <div class="field-row">
          <div class="field" :class="{ 'has-error': showErrors && !loanAccountNumber.trim() }">
            <label>Loan Account Number *</label>
            <input v-model="loanAccountNumber" type="text" placeholder="e.g. 1234567" />
            <div v-if="showErrors && !loanAccountNumber.trim()" class="err-msg">Required</div>
          </div>
        </div>
      </div>

      <!-- Direct Debit Accounts -->
      <div class="card">
        <div class="card-title">Direct Debit Account(s)</div>

        <div v-if="showErrors && accounts.length === 0" class="err-msg" style="margin-bottom:12px">
          At least one direct debit account is required
        </div>

        <div v-for="(acc, ai) in accounts" :key="ai" class="account-block">
          <div class="account-block-header">
            <span class="account-block-num">Account {{ ai + 1 }}</span>
            <button
              v-if="accounts.length > 1"
              type="button"
              class="btn-remove"
              @click="removeAccount(ai)"
            >Remove</button>
          </div>

          <!-- Bank Name / Account Name -->
          <div class="field-row">
            <div class="field" :class="{ 'has-error': showErrors && !acc.bank_name.trim() }">
              <label>Bank Name *</label>
              <input v-model="acc.bank_name" type="text" placeholder="e.g. Commonwealth Bank" />
              <div v-if="showErrors && !acc.bank_name.trim()" class="err-msg">Required</div>
            </div>
            <div class="field" :class="{ 'has-error': showErrors && !acc.account_name.trim() }">
              <label>Account Name *</label>
              <input v-model="acc.account_name" type="text" placeholder="e.g. Jane Smith" />
              <div v-if="showErrors && !acc.account_name.trim()" class="err-msg">Required</div>
            </div>
          </div>

          <!-- BSB / Account Number -->
          <div class="field-row">
            <div class="field" :class="{ 'has-error': showErrors && !isBsbValid(acc.bsb) }">
              <label>BSB *</label>
              <input
                v-model="acc.bsb"
                type="text"
                placeholder="000-000"
                maxlength="7"
                @input="(e) => formatBsb(e, ai)"
              />
              <div v-if="showErrors && !isBsbValid(acc.bsb)" class="err-msg">Enter a valid BSB (e.g. 062-000)</div>
            </div>
            <div class="field" :class="{ 'has-error': showErrors && !acc.account_number.trim() }">
              <label>Account Number *</label>
              <input v-model="acc.account_number" type="text" placeholder="e.g. 12345678" />
              <div v-if="showErrors && !acc.account_number.trim()" class="err-msg">Required</div>
            </div>
          </div>

          <!-- Payment Frequency -->
          <span class="toggle-label">Payment Frequency *</span>
          <div class="toggle-row">
            <label v-for="opt in frequencyOptions" :key="opt.value" class="toggle-opt">
              <input
                type="radio"
                :name="`freq-${ai}`"
                :value="opt.value"
                :checked="acc.payment_frequency === opt.value"
                @change="acc.payment_frequency = opt.value as PaymentFrequency"
              />
              <span>{{ opt.label }}</span>
            </label>
          </div>

          <!-- Amount Type -->
          <span class="toggle-label">Amount Type *</span>
          <div class="toggle-row">
            <label v-for="opt in amountOptions" :key="opt.value" class="toggle-opt">
              <input
                type="radio"
                :name="`amt-${ai}`"
                :value="opt.value"
                :checked="acc.amount_type === opt.value"
                @change="acc.amount_type = opt.value as AmountType"
              />
              <span>{{ opt.label }}</span>
            </label>
          </div>

          <!-- Fixed / Other Amount Input -->
          <div
            v-if="acc.amount_type === 'fixed' || acc.amount_type === 'other'"
            class="field-row"
          >
            <div
              class="field amount-field"
              :class="{ 'has-error': showErrors && !(acc.fixed_amount && acc.fixed_amount > 0) }"
            >
              <label>{{ acc.amount_type === 'fixed' ? 'Fixed Amount' : 'Other Amount' }} ($) *</label>
              <div class="dollar-wrap">
                <span class="dollar-sign">$</span>
                <input
                  v-model.number="acc.fixed_amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  class="dollar-input"
                />
              </div>
              <div v-if="showErrors && !(acc.fixed_amount && acc.fixed_amount > 0)" class="err-msg">
                Amount must be greater than $0
              </div>
            </div>
          </div>

          <!-- Bank Statement Upload -->
          <div class="field" :class="{ 'has-error': showErrors && !acc.bank_statement_base64 }">
            <label>Bank Statement * <span class="field-hint">(PDF, JPG or PNG – max 10 MB)</span></label>
            <div class="file-drop" :class="{ 'file-drop--filled': !!acc.bank_statement_filename }">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                class="file-input"
                @change="(e) => handleFile(e, ai)"
              />
              <div v-if="acc.bank_statement_filename" class="file-name">
                {{ acc.bank_statement_filename }}
              </div>
              <div v-else class="file-placeholder">Click or drag to upload bank statement</div>
            </div>
            <div v-if="showErrors && !acc.bank_statement_base64" class="err-msg">Bank statement is required</div>
          </div>

          <hr v-if="ai < accounts.length - 1" class="account-divider" />
        </div>

        <button
          v-if="accounts.length < 4"
          type="button"
          class="btn-add"
          @click="addAccount"
        >+ Add Another Account</button>
      </div>

      <!-- Authorisations -->
      <div class="card">
        <div class="card-title">Customer Authorisation</div>
        <p class="auth-note">
          By signing below, I/we authorise WLTH Lend Pty Ltd to debit the nominated account(s) in
          accordance with the instructions above and the Direct Debit Request Service Agreement.
        </p>

        <div v-for="(b, i) in borrowers" :key="i" class="auth-card">
          <div class="auth-card-title">Borrower {{ i + 1 }} – {{ b.given_names || '...' }} {{ b.surname || '' }}</div>

          <div class="field-row">
            <div class="field">
              <label>Home Contact (optional)</label>
              <input v-model="auths[i].home_contact" type="tel" placeholder="e.g. 02 9000 0000" />
            </div>
            <div class="field">
              <label>Work Contact (optional)</label>
              <input v-model="auths[i].work_contact" type="tel" placeholder="e.g. 02 9000 0001" />
            </div>
          </div>

          <div class="field-row">
            <div class="field" :class="{ 'has-error': showErrors && !auths[i].signed_date }">
              <label>Date *</label>
              <input v-model="auths[i].signed_date" type="date" />
              <div v-if="showErrors && !auths[i].signed_date" class="err-msg">Required</div>
            </div>
          </div>

          <SignatureCanvas
            :error="showErrors && !sigs[i]"
            @update:value="(v) => (sigs[i] = v)"
          />
        </div>
      </div>

      <!-- Submit -->
      <div v-if="apiError" class="err-msg" style="margin-bottom:12px; font-size:13px">{{ apiError }}</div>
      <button class="btn-submit" :disabled="submitting" @click="submit">
        {{ submitting ? 'Submitting…' : 'Submit Direct Debit Request' }}
      </button>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PaymentFrequency, AmountType, DirectDebitAccount, Authorisation } from '~/types'

useHead({ title: 'Direct Debit Request – WLTH' })

// ─── Types ────────────────────────────────────────────────────────────────────

interface BorrowerForm {
  surname: string
  given_names: string
}

interface AccountForm extends Omit<DirectDebitAccount, 'bank_statement_base64' | 'bank_statement_filename'> {
  bank_statement_base64: string
  bank_statement_filename: string
}

interface AuthForm {
  home_contact: string
  work_contact: string
  signed_date: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const frequencyOptions: { value: PaymentFrequency; label: string }[] = [
  { value: 'weekly',      label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly',     label: 'Monthly' },
]

const amountOptions: { value: AmountType; label: string }[] = [
  { value: 'minimum', label: 'Minimum Repayment' },
  { value: 'fixed',   label: 'Fixed Amount' },
  { value: 'other',   label: 'Other Amount' },
]

// ─── State ────────────────────────────────────────────────────────────────────

const borrowerCount   = ref(1)
const loanAccountNumber = ref('')
const showErrors      = ref(false)
const submitting      = ref(false)
const submitted       = ref(false)
const submissionId    = ref('')
const apiError        = ref('')

function makeBorrower(): BorrowerForm { return { surname: '', given_names: '' } }
function makeAccount(): AccountForm {
  return {
    bank_name: '',
    account_name: '',
    bsb: '',
    account_number: '',
    payment_frequency: 'monthly',
    amount_type: 'minimum',
    fixed_amount: undefined,
    bank_statement_base64: '',
    bank_statement_filename: '',
  }
}
function makeAuth(): AuthForm { return { home_contact: '', work_contact: '', signed_date: '' } }

const borrowers = ref<BorrowerForm[]>([makeBorrower()])
const accounts  = ref<AccountForm[]>([makeAccount()])
const auths     = ref<AuthForm[]>([makeAuth()])
const sigs      = ref<(string | null)[]>([null])

// ─── Borrower count management ────────────────────────────────────────────────

function setBorrowerCount(n: number) {
  borrowerCount.value = n
  while (borrowers.value.length < n) { borrowers.value.push(makeBorrower()); auths.value.push(makeAuth()); sigs.value.push(null) }
  borrowers.value.splice(n)
  auths.value.splice(n)
  sigs.value.splice(n)
}

// ─── Account management ───────────────────────────────────────────────────────

function addAccount() {
  if (accounts.value.length < 4) accounts.value.push(makeAccount())
}
function removeAccount(i: number) {
  accounts.value.splice(i, 1)
}

// ─── BSB formatting ───────────────────────────────────────────────────────────

function formatBsb(e: Event, ai: number) {
  const input = e.target as HTMLInputElement
  let raw = input.value.replace(/\D/g, '').slice(0, 6)
  if (raw.length > 3) raw = raw.slice(0, 3) + '-' + raw.slice(3)
  accounts.value[ai].bsb = raw
  // keep cursor at end
  nextTick(() => { input.setSelectionRange(raw.length, raw.length) })
}

function isBsbValid(bsb: string): boolean {
  return /^\d{3}-\d{3}$/.test(bsb)
}

// ─── File upload ──────────────────────────────────────────────────────────────

function handleFile(e: Event, ai: number) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    accounts.value[ai].bank_statement_base64  = reader.result as string
    accounts.value[ai].bank_statement_filename = file.name
  }
  reader.readAsDataURL(file)
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(): boolean {
  // Borrowers
  for (const b of borrowers.value) {
    if (!b.surname.trim() || !b.given_names.trim()) return false
  }
  // Loan number
  if (!loanAccountNumber.value.trim()) return false
  // Accounts
  if (accounts.value.length === 0) return false
  for (const acc of accounts.value) {
    if (!acc.bank_name.trim())     return false
    if (!acc.account_name.trim())  return false
    if (!isBsbValid(acc.bsb))      return false
    if (!acc.account_number.trim()) return false
    if (!acc.bank_statement_base64) return false
    if ((acc.amount_type === 'fixed' || acc.amount_type === 'other') && !(acc.fixed_amount && acc.fixed_amount > 0)) return false
  }
  // Authorisations
  for (let i = 0; i < borrowers.value.length; i++) {
    if (!auths.value[i].signed_date) return false
    if (!sigs.value[i])              return false
  }
  return true
}

// ─── Submit ───────────────────────────────────────────────────────────────────

async function submit() {
  showErrors.value = true
  if (!validate()) return

  submitting.value = true
  apiError.value = ''

  try {
    const payload = {
      borrowers: borrowers.value.map(b => ({ surname: b.surname.trim(), given_names: b.given_names.trim() })),
      loan_account_number: loanAccountNumber.value.trim(),
      accounts: accounts.value.map(acc => ({
        bank_name:               acc.bank_name.trim(),
        account_name:            acc.account_name.trim(),
        bsb:                     acc.bsb,
        account_number:          acc.account_number.trim(),
        payment_frequency:       acc.payment_frequency,
        amount_type:             acc.amount_type,
        fixed_amount:            (acc.amount_type === 'fixed' || acc.amount_type === 'other') ? acc.fixed_amount : undefined,
        bank_statement_base64:   acc.bank_statement_base64,
        bank_statement_filename: acc.bank_statement_filename,
      })),
      authorisations: borrowers.value.map((_, i) => ({
        signature_base64: sigs.value[i] as string,
        signed_date:      auths.value[i].signed_date,
        home_contact:     auths.value[i].home_contact || undefined,
        work_contact:     auths.value[i].work_contact || undefined,
      })),
    }

    const res = await fetch('/api/direct-debit/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Submission failed' }))
      throw new Error(err.message || 'Submission failed')
    }

    const data = await res.json()
    submissionId.value = data.id
    submitted.value    = true
  } catch (err: unknown) {
    apiError.value = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
  } finally {
    submitting.value = false
  }
}

// ─── Reset ────────────────────────────────────────────────────────────────────

function reset() {
  borrowerCount.value     = 1
  loanAccountNumber.value = ''
  borrowers.value         = [makeBorrower()]
  accounts.value          = [makeAccount()]
  auths.value             = [makeAuth()]
  sigs.value              = [null]
  showErrors.value        = false
  submitted.value         = false
  submissionId.value      = ''
  apiError.value          = ''
}

// nextTick shim for BSB cursor
function nextTick(fn: () => void) { Promise.resolve().then(fn) }
</script>

<style scoped>
.borrower-heading {
  font-size: 12px; font-weight: 700; color: var(--muted);
  text-transform: uppercase; letter-spacing: 0.05em;
  margin-bottom: 10px; margin-top: 4px;
}
.borrower-heading:first-child { margin-top: 0; }

/* separate borrower sections inside the card */
.borrowers-section + .borrowers-section { border-top: 1px solid var(--border); padding-top: 14px; margin-top: 4px; }

/* Account blocks */
.account-block { margin-bottom: 4px; }
.account-block-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 12px;
}
.account-block-num { font-size: 13px; font-weight: 700; color: var(--dark); }
.btn-remove {
  background: none; border: 1px solid var(--error); color: var(--error);
  border-radius: 6px; font-size: 12px; padding: 4px 10px; cursor: pointer;
  transition: all 0.15s;
}
.btn-remove:hover { background: var(--error); color: #fff; }
.account-divider { border: none; border-top: 1px solid var(--border); margin: 20px 0; }

/* Add account button */
.btn-add {
  display: inline-flex; align-items: center; gap: 4px;
  margin-top: 12px; background: none; border: 1.5px dashed var(--border);
  border-radius: 8px; color: var(--muted); font-size: 13px; font-weight: 600;
  padding: 10px 18px; cursor: pointer; width: 100%; justify-content: center;
  transition: all 0.15s;
}
.btn-add:hover { border-color: var(--dark); color: var(--dark); }

/* Dollar input */
.dollar-wrap { position: relative; display: flex; align-items: center; }
.dollar-sign {
  position: absolute; left: 10px; font-size: 14px; color: var(--muted); pointer-events: none;
}
.dollar-input { padding-left: 24px !important; }

/* File upload */
.file-drop {
  position: relative; border: 1.5px dashed var(--border); border-radius: 8px;
  min-height: 48px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: border-color 0.15s; overflow: hidden;
}
.file-drop:hover { border-color: var(--dark); }
.file-drop--filled { border-style: solid; border-color: var(--dark); background: #f7f9ff; }
.file-input {
  position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;
}
.file-placeholder { font-size: 13px; color: var(--muted); padding: 12px; }
.file-name { font-size: 13px; color: var(--dark); font-weight: 600; padding: 12px; }
.field-hint { font-weight: 400; font-size: 11px; color: var(--muted); }

/* Auth note */
.auth-note {
  font-size: 13px; color: var(--muted); line-height: 1.6;
  margin-bottom: 18px; padding: 12px 14px; background: var(--grey);
  border-radius: 8px; border-left: 3px solid var(--border);
}
</style>
