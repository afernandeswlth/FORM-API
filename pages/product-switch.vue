<template>
  <div>
    <AppHeader title="Product Switch Request" />

    <SuccessOverlay
      v-if="submitted"
      :ref-id="submissionId"
      @reset="reset"
    />

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
            <input type="radio" :value="n" v-model="borrowerCount" />
            {{ n }} {{ n === 1 ? 'Borrower' : 'Borrowers' }}
          </label>
        </div>
      </div>

      <!-- Borrower Details -->
      <div class="card">
        <div class="card-title">Borrower Details</div>
        <div v-for="(b, i) in borrowers" :key="i" class="borrower-block">
          <div class="borrower-block-label">Borrower {{ i + 1 }}</div>
          <div class="field-row">
            <div class="field" :class="{ 'has-error': showErrors && !b.surname.trim() }">
              <label>SURNAME *</label>
              <input v-model="b.surname" type="text" placeholder="Smith" />
              <div v-if="showErrors && !b.surname.trim()" class="err-msg">Required</div>
            </div>
            <div class="field" :class="{ 'has-error': showErrors && !b.given_names.trim() }">
              <label>GIVEN NAME(S) *</label>
              <input v-model="b.given_names" type="text" placeholder="John" />
              <div v-if="showErrors && !b.given_names.trim()" class="err-msg">Required</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loan Switch Details -->
      <div class="card">
        <div class="card-title-row">
          <span class="card-title" style="margin-bottom:0;padding-bottom:0;border-bottom:none;">Loan Switch Details</span>
          <span class="switch-badge">{{ loanSwitches.length }} of 3</span>
        </div>
        <div style="border-bottom:1px solid var(--border);margin-bottom:18px;margin-top:10px;"></div>

        <div v-if="showErrors && loanSwitches.length === 0" class="err-msg" style="margin-bottom:12px;">
          At least one loan switch is required.
        </div>

        <div
          v-for="(sw, i) in loanSwitches"
          :key="sw._id"
          class="loan-switch-block"
        >
          <div class="loan-switch-header">
            <span class="loan-switch-num">Loan Switch {{ i + 1 }}</span>
            <button type="button" class="btn-remove" @click="removeLoanSwitch(i)">Remove</button>
          </div>

          <!-- Loan Account Number -->
          <div class="field-row">
            <div class="field" :class="{ 'has-error': showErrors && !sw.loan_account_number.trim() }">
              <label>LOAN ACCOUNT NUMBER *</label>
              <input v-model="sw.loan_account_number" type="text" placeholder="e.g. 100012345" />
              <div v-if="showErrors && !sw.loan_account_number.trim()" class="err-msg">Required</div>
            </div>
          </div>

          <!-- Repayment Type -->
          <div>
            <span class="toggle-label">REPAYMENT TYPE *</span>
            <div class="toggle-row">
              <label class="toggle-opt">
                <input type="radio" :name="'repayment_' + sw._id" value="principal_and_interest" v-model="sw.repayment_type" />
                <span>Principal &amp; Interest</span>
              </label>
              <label class="toggle-opt">
                <input type="radio" :name="'repayment_' + sw._id" value="interest_only" v-model="sw.repayment_type" />
                <span>Interest Only</span>
              </label>
            </div>

            <div v-if="sw.repayment_type === 'interest_only'" class="field-row">
              <div
                class="field"
                style="max-width:220px;"
                :class="{ 'has-error': showErrors && !isValidIOYears(sw.interest_only_years) }"
              >
                <label>IO TERM (YEARS) *</label>
                <input
                  v-model.number="sw.interest_only_years"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 5"
                />
                <div v-if="showErrors && !isValidIOYears(sw.interest_only_years)" class="err-msg">
                  Required – enter a whole number of at least 1
                </div>
              </div>
            </div>
          </div>

          <!-- Rate Type -->
          <div>
            <span class="toggle-label">RATE TYPE *</span>
            <div class="toggle-row">
              <label class="toggle-opt">
                <input type="radio" :name="'rate_' + sw._id" value="variable" v-model="sw.rate_type" />
                <span>Variable</span>
              </label>
              <label class="toggle-opt">
                <input type="radio" :name="'rate_' + sw._id" value="fixed" v-model="sw.rate_type" />
                <span>Fixed</span>
              </label>
            </div>

            <div v-if="sw.rate_type === 'fixed'" class="field-row">
              <div
                class="field"
                :class="{ 'has-error': showErrors && !isValidFixedRate(sw.fixed_rate_percent) }"
              >
                <label>FIXED RATE (%) *</label>
                <input
                  v-model.number="sw.fixed_rate_percent"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="e.g. 5.99"
                />
                <div v-if="showErrors && !isValidFixedRate(sw.fixed_rate_percent)" class="err-msg">
                  Required – must be greater than 0
                </div>
              </div>
              <div
                class="field"
                :class="{ 'has-error': showErrors && !isValidFixedPeriod(sw.fixed_period_years) }"
              >
                <label>FIXED PERIOD (YEARS) *</label>
                <input
                  v-model.number="sw.fixed_period_years"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 3"
                />
                <div v-if="showErrors && !isValidFixedPeriod(sw.fixed_period_years)" class="err-msg">
                  Required – enter a whole number of at least 1
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          v-if="loanSwitches.length < 3"
          type="button"
          class="btn-add-switch"
          @click="addLoanSwitch"
        >
          + Add Loan Switch
        </button>
      </div>

      <!-- Reason for Request -->
      <div class="card">
        <div class="card-title">Reason for Request <span style="font-weight:400;color:var(--muted);">(optional)</span></div>
        <div class="field">
          <label>REASON</label>
          <textarea
            v-model="reasonForRequest"
            rows="4"
            placeholder="Provide any additional context or reason for this product switch request..."
          ></textarea>
        </div>
      </div>

      <!-- Authorisation -->
      <div class="card">
        <div class="card-title">Customer Authorisation</div>

        <div v-for="(b, i) in borrowers" :key="i" class="auth-card">
          <div class="auth-card-title">Borrower {{ i + 1 }} – {{ fullName(b) || '(name not entered)' }}</div>

          <div class="field-row">
            <div class="field">
              <label>HOME CONTACT (OPTIONAL)</label>
              <input v-model="auths[i].home_contact" type="text" placeholder="04XX XXX XXX" />
            </div>
            <div class="field">
              <label>WORK CONTACT (OPTIONAL)</label>
              <input v-model="auths[i].work_contact" type="text" placeholder="02 XXXX XXXX" />
            </div>
          </div>

          <div class="field-row">
            <div
              class="field"
              style="max-width:220px;"
              :class="{ 'has-error': showErrors && !auths[i].signed_date }"
            >
              <label>DATE *</label>
              <input v-model="auths[i].signed_date" type="date" />
              <div v-if="showErrors && !auths[i].signed_date" class="err-msg">Required</div>
            </div>
          </div>

          <SignatureCanvas
            :error="showErrors && !sigs[i]"
            @update:value="v => sigs[i] = v"
          />
        </div>
      </div>

      <!-- Submit -->
      <div v-if="submitError" class="err-msg" style="margin-bottom:10px;font-size:13px;">
        {{ submitError }}
      </div>

      <button
        type="button"
        class="btn-submit"
        :disabled="submitting"
        @click="handleSubmit"
      >
        {{ submitting ? 'Submitting…' : 'Submit Product Switch Request' }}
      </button>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Borrower, Authorisation, LoanSwitch, ProductSwitchSubmission } from '~/types'

useHead({ title: 'Product Switch Request – WLTH' })

// ── Types ────────────────────────────────────────────────────────────────────

interface LoanSwitchDraft extends LoanSwitch {
  _id: number
}

interface AuthDraft {
  home_contact: string
  work_contact: string
  signed_date: string
}

// ── State ────────────────────────────────────────────────────────────────────

let _idCounter = 0

function newSwitch(): LoanSwitchDraft {
  return {
    _id: ++_idCounter,
    loan_account_number: '',
    repayment_type: 'principal_and_interest',
    interest_only_years: undefined,
    rate_type: 'variable',
    fixed_rate_percent: undefined,
    fixed_period_years: undefined,
  }
}

function newBorrower(): Borrower {
  return { surname: '', given_names: '' }
}

function newAuth(): AuthDraft {
  return { home_contact: '', work_contact: '', signed_date: '' }
}

const borrowerCount = ref(1)
const borrowers = ref<Borrower[]>([newBorrower()])
const auths = ref<AuthDraft[]>([newAuth()])
const sigs = ref<(string | null)[]>([null])
const loanSwitches = ref<LoanSwitchDraft[]>([newSwitch()])
const reasonForRequest = ref('')

const showErrors = ref(false)
const submitting = ref(false)
const submitted = ref(false)
const submissionId = ref('')
const submitError = ref('')

// ── Watchers ─────────────────────────────────────────────────────────────────

function setBorrowerCount(n: number) {
  borrowerCount.value = n
  while (borrowers.value.length < n) {
    borrowers.value.push(newBorrower())
    auths.value.push(newAuth())
    sigs.value.push(null)
  }
  borrowers.value.splice(n)
  auths.value.splice(n)
  sigs.value.splice(n)
}

watch(borrowerCount, (n) => setBorrowerCount(n))

// ── Helpers ───────────────────────────────────────────────────────────────────

function fullName(b: Borrower): string {
  return [b.given_names, b.surname].filter(Boolean).join(' ')
}

function isValidIOYears(v: number | undefined): boolean {
  return typeof v === 'number' && Number.isInteger(v) && v >= 1
}

function isValidFixedRate(v: number | undefined): boolean {
  return typeof v === 'number' && v > 0
}

function isValidFixedPeriod(v: number | undefined): boolean {
  return typeof v === 'number' && Number.isInteger(v) && v >= 1
}

// ── Loan Switch management ────────────────────────────────────────────────────

function addLoanSwitch() {
  if (loanSwitches.value.length < 3) {
    loanSwitches.value.push(newSwitch())
  }
}

function removeLoanSwitch(i: number) {
  loanSwitches.value.splice(i, 1)
}

// ── Validation ────────────────────────────────────────────────────────────────

function validate(): boolean {
  // Borrowers
  for (const b of borrowers.value) {
    if (!b.surname.trim() || !b.given_names.trim()) return false
  }

  // At least 1 switch
  if (loanSwitches.value.length === 0) return false

  // Each switch
  for (const sw of loanSwitches.value) {
    if (!sw.loan_account_number.trim()) return false
    if (sw.repayment_type === 'interest_only' && !isValidIOYears(sw.interest_only_years)) return false
    if (sw.rate_type === 'fixed') {
      if (!isValidFixedRate(sw.fixed_rate_percent)) return false
      if (!isValidFixedPeriod(sw.fixed_period_years)) return false
    }
  }

  // Authorisations
  for (let i = 0; i < borrowers.value.length; i++) {
    if (!auths.value[i].signed_date) return false
    if (!sigs.value[i]) return false
  }

  return true
}

// ── Submit ────────────────────────────────────────────────────────────────────

async function handleSubmit() {
  showErrors.value = true
  if (!validate()) return

  submitting.value = true
  submitError.value = ''

  try {
    const authorisations: Authorisation[] = borrowers.value.map((_, i) => ({
      signature_base64: sigs.value[i]!,
      signed_date: auths.value[i].signed_date,
      home_contact: auths.value[i].home_contact || undefined,
      work_contact: auths.value[i].work_contact || undefined,
    }))

    const switches: LoanSwitch[] = loanSwitches.value.map(sw => {
      const out: LoanSwitch = {
        loan_account_number: sw.loan_account_number.trim(),
        repayment_type: sw.repayment_type,
        rate_type: sw.rate_type,
      }
      if (sw.repayment_type === 'interest_only') {
        out.interest_only_years = sw.interest_only_years
      }
      if (sw.rate_type === 'fixed') {
        out.fixed_rate_percent = sw.fixed_rate_percent
        out.fixed_period_years = sw.fixed_period_years
      }
      return out
    })

    const payload: ProductSwitchSubmission = {
      borrowers: borrowers.value.map(b => ({ surname: b.surname.trim(), given_names: b.given_names.trim() })),
      loan_switches: switches,
      reason_for_request: reasonForRequest.value.trim() || undefined,
      authorisations,
    }

    const res = await fetch('/api/product-switch/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error((err as any).message ?? `Server error ${res.status}`)
    }

    const data = await res.json()
    submissionId.value = data.id
    submitted.value = true
  } catch (e: any) {
    submitError.value = e?.message ?? 'Submission failed. Please try again.'
  } finally {
    submitting.value = false
  }
}

// ── Reset ─────────────────────────────────────────────────────────────────────

function reset() {
  _idCounter = 0
  borrowerCount.value = 1
  borrowers.value = [newBorrower()]
  auths.value = [newAuth()]
  sigs.value = [null]
  loanSwitches.value = [newSwitch()]
  reasonForRequest.value = ''
  showErrors.value = false
  submitted.value = false
  submissionId.value = ''
  submitError.value = ''
}
</script>

<style scoped>
.card-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.switch-badge {
  display: inline-block;
  background: var(--dark);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.borrower-block {
  margin-bottom: 18px;
}

.borrower-block:last-child {
  margin-bottom: 0;
}

.borrower-block-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
}

.loan-switch-block {
  border: 1.5px solid var(--border);
  border-radius: 8px;
  padding: 18px;
  margin-bottom: 14px;
}

.loan-switch-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.loan-switch-num {
  font-size: 13px;
  font-weight: 700;
  color: var(--dark);
}

.btn-remove {
  background: none;
  border: 1px solid var(--border);
  color: var(--muted);
  border-radius: 6px;
  font-size: 12px;
  padding: 4px 10px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-remove:hover {
  border-color: var(--error);
  color: var(--error);
}

.btn-add-switch {
  width: 100%;
  padding: 11px;
  background: var(--grey);
  border: 1.5px dashed var(--border);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--dark);
  cursor: pointer;
  transition: all 0.15s;
  margin-top: 4px;
}

.btn-add-switch:hover {
  border-color: var(--dark);
  background: #e8e8ec;
}
</style>
