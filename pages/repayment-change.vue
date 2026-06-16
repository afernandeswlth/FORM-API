<template>
  <div>
    <AppHeader title="Repayment Change" />

    <SuccessOverlay
      v-if="submitted"
      :ref-id="submissionId"
      @reset="reset"
    />

    <div class="container">
      <p class="form-desc">
        Request a change to your repayment amount or payment frequency on one or more loan accounts.
      </p>

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
        <div v-for="(b, i) in borrowers" :key="i" style="margin-bottom: 20px;">
          <div style="font-size: 13px; font-weight: 700; color: var(--muted); margin-bottom: 10px;">
            Borrower {{ i + 1 }}
          </div>
          <div class="field-row">
            <div class="field" :class="{ 'has-error': showErrors && !b.surname.trim() }">
              <label>Surname *</label>
              <input v-model="b.surname" type="text" placeholder="Last name" />
              <div v-if="showErrors && !b.surname.trim()" class="err-msg">Surname is required</div>
            </div>
            <div class="field" :class="{ 'has-error': showErrors && !b.given_names.trim() }">
              <label>Given Name(s) *</label>
              <input v-model="b.given_names" type="text" placeholder="First and middle names" />
              <div v-if="showErrors && !b.given_names.trim()" class="err-msg">Given name(s) required</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Repayment Changes -->
      <div class="card">
        <div class="card-title">Repayment Changes</div>

        <div
          v-for="(change, i) in repaymentChanges"
          :key="i"
          class="change-block"
        >
          <div class="change-header">
            <span class="change-num">Change {{ i + 1 }}</span>
            <button
              v-if="repaymentChanges.length > 1"
              type="button"
              class="btn-remove"
              @click="removeChange(i)"
            >
              Remove
            </button>
          </div>

          <div class="field-row">
            <div
              class="field"
              :class="{ 'has-error': showErrors && !change.loan_account_number.trim() }"
            >
              <label>Loan Account Number *</label>
              <input
                v-model="change.loan_account_number"
                type="text"
                placeholder="e.g. 1234567890"
              />
              <div
                v-if="showErrors && !change.loan_account_number.trim()"
                class="err-msg"
              >
                Loan account number is required
              </div>
            </div>
            <div
              class="field"
              :class="{ 'has-error': showErrors && !(change.new_amount > 0) }"
            >
              <label>New Repayment Amount ($) *</label>
              <input
                v-model.number="change.new_amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
              />
              <div
                v-if="showErrors && !(change.new_amount > 0)"
                class="err-msg"
              >
                Amount must be greater than $0
              </div>
            </div>
          </div>

          <span class="toggle-label">Payment Frequency *</span>
          <div class="toggle-row">
            <label
              v-for="opt in frequencyOptions"
              :key="opt.value"
              class="toggle-opt"
              :class="{ 'has-error': showErrors && !change.frequency }"
            >
              <input
                type="radio"
                :name="`freq-${i}`"
                :value="opt.value"
                v-model="change.frequency"
              />
              <span>{{ opt.label }}</span>
            </label>
          </div>
          <div
            v-if="showErrors && !change.frequency"
            class="err-msg"
            style="margin-top: -10px; margin-bottom: 10px;"
          >
            Payment frequency is required
          </div>

          <hr v-if="i < repaymentChanges.length - 1" class="change-divider" />
        </div>

        <button
          v-if="repaymentChanges.length < 4"
          type="button"
          class="btn-add"
          @click="addChange"
        >
          + Add Another Loan
        </button>
      </div>

      <!-- Comments -->
      <div class="card">
        <div class="card-title">Additional Comments</div>
        <div class="field">
          <label>Comments (optional)</label>
          <textarea
            v-model="comments"
            rows="4"
            placeholder="Any additional information or special instructions..."
          />
        </div>
      </div>

      <!-- Authorisation per borrower -->
      <div class="card">
        <div class="card-title">Customer Authorisation</div>
        <p style="font-size: 13px; color: var(--muted); margin-bottom: 18px;">
          By signing below, each borrower authorises WLTH to make the requested repayment changes.
        </p>

        <div v-for="(b, i) in borrowers" :key="i" class="auth-card">
          <div class="auth-card-title">
            {{ b.given_names.trim() || 'Borrower ' + (i + 1) }}
            {{ b.surname.trim() }}
          </div>

          <div class="field-row">
            <div class="field">
              <label>Home Contact (optional)</label>
              <input v-model="auths[i].home_contact" type="tel" placeholder="e.g. 02 9999 0000" />
            </div>
            <div class="field">
              <label>Work Contact (optional)</label>
              <input v-model="auths[i].work_contact" type="tel" placeholder="e.g. 02 8888 0000" />
            </div>
          </div>

          <div class="field-row">
            <div
              class="field"
              :class="{ 'has-error': showErrors && !auths[i].signed_date }"
            >
              <label>Date *</label>
              <input v-model="auths[i].signed_date" type="date" />
              <div v-if="showErrors && !auths[i].signed_date" class="err-msg">Date is required</div>
            </div>
          </div>

          <SignatureCanvas
            :error="showErrors && !sigs[i]"
            @update:value="v => sigs[i] = v"
          />
        </div>
      </div>

      <!-- Submit -->
      <div v-if="submitError" class="err-msg" style="margin-bottom: 12px; font-size: 13px;">
        {{ submitError }}
      </div>

      <button
        type="button"
        class="btn-submit"
        :disabled="submitting"
        @click="submit"
      >
        {{ submitting ? 'Submitting...' : 'Submit Repayment Change Request' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { RepaymentChangeSubmission, PaymentFrequency } from '~/types'

useHead({ title: 'Repayment Change – WLTH Forms' })

// ── Types ────────────────────────────────────────────────────────────────────

interface ChangeRow {
  loan_account_number: string
  new_amount: number | null
  frequency: PaymentFrequency | ''
}

interface AuthRow {
  signed_date: string
  home_contact: string
  work_contact: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const frequencyOptions: { label: string; value: PaymentFrequency }[] = [
  { label: 'Weekly',      value: 'weekly' },
  { label: 'Fortnightly', value: 'fortnightly' },
  { label: 'Monthly',     value: 'monthly' },
]

// ── State ─────────────────────────────────────────────────────────────────────

const borrowerCount = ref(1)

function makeBorrower() { return { surname: '', given_names: '' } }
function makeChange(): ChangeRow { return { loan_account_number: '', new_amount: null, frequency: '' } }
function makeAuth(): AuthRow { return { signed_date: '', home_contact: '', work_contact: '' } }

const borrowers   = ref([makeBorrower()])
const repaymentChanges = ref<ChangeRow[]>([makeChange()])
const comments    = ref('')
const auths       = ref<AuthRow[]>([makeAuth()])
const sigs        = ref<(string | null)[]>([null])

const showErrors  = ref(false)
const submitting  = ref(false)
const submitted   = ref(false)
const submissionId = ref('')
const submitError = ref('')

// ── Borrower count sync ───────────────────────────────────────────────────────

function setBorrowerCount(n: number) {
  borrowerCount.value = n
}

watch(borrowerCount, (n) => {
  while (borrowers.value.length < n) borrowers.value.push(makeBorrower())
  while (borrowers.value.length > n) borrowers.value.pop()

  while (auths.value.length < n) auths.value.push(makeAuth())
  while (auths.value.length > n) auths.value.pop()

  while (sigs.value.length < n) sigs.value.push(null)
  while (sigs.value.length > n) sigs.value.pop()
})

// ── Change add / remove ───────────────────────────────────────────────────────

function addChange() {
  if (repaymentChanges.value.length < 4) repaymentChanges.value.push(makeChange())
}

function removeChange(i: number) {
  repaymentChanges.value.splice(i, 1)
}

// ── Validation ────────────────────────────────────────────────────────────────

function validate(): boolean {
  // Borrowers
  for (const b of borrowers.value) {
    if (!b.surname.trim() || !b.given_names.trim()) return false
  }

  // At least 1 change
  if (repaymentChanges.value.length === 0) return false

  // Each change
  for (const c of repaymentChanges.value) {
    if (!c.loan_account_number.trim()) return false
    if (!(c.new_amount !== null && c.new_amount > 0)) return false
    if (!c.frequency) return false
  }

  // Authorisations
  for (let i = 0; i < borrowers.value.length; i++) {
    if (!auths.value[i].signed_date) return false
    if (!sigs.value[i]) return false
  }

  return true
}

// ── Submit ────────────────────────────────────────────────────────────────────

async function submit() {
  showErrors.value = true
  submitError.value = ''

  if (!validate()) return

  const payload: RepaymentChangeSubmission = {
    borrowers: borrowers.value.map(b => ({
      surname:     b.surname.trim(),
      given_names: b.given_names.trim(),
    })),
    repayment_changes: repaymentChanges.value.map(c => ({
      loan_account_number: c.loan_account_number.trim(),
      new_amount:          c.new_amount as number,
      frequency:           c.frequency as PaymentFrequency,
    })),
    comments: comments.value.trim() || undefined,
    authorisations: auths.value.map((a, i) => ({
      signature_base64: sigs.value[i] as string,
      signed_date:      a.signed_date,
      home_contact:     a.home_contact.trim() || undefined,
      work_contact:     a.work_contact.trim() || undefined,
    })),
  }

  submitting.value = true
  try {
    const res = await $fetch<{ id: string; status: string; created_at: string }>(
      '/api/repayment-change/submit',
      { method: 'POST', body: payload }
    )
    submissionId.value = res.id
    submitted.value = true
  } catch (err: unknown) {
    const msg =
      err && typeof err === 'object' && 'data' in err
        ? (err as { data?: { message?: string } }).data?.message
        : undefined
    submitError.value = msg ?? 'Submission failed. Please try again.'
  } finally {
    submitting.value = false
  }
}

// ── Reset ─────────────────────────────────────────────────────────────────────

function reset() {
  borrowerCount.value = 1
  borrowers.value     = [makeBorrower()]
  repaymentChanges.value = [makeChange()]
  comments.value      = ''
  auths.value         = [makeAuth()]
  sigs.value          = [null]
  showErrors.value    = false
  submitted.value     = false
  submissionId.value  = ''
  submitError.value   = ''
}
</script>

<style scoped>
.change-block {
  padding: 16px 0;
}
.change-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.change-num {
  font-size: 13px;
  font-weight: 700;
  color: var(--dark);
}
.btn-remove {
  background: none;
  border: 1px solid var(--border);
  color: var(--error);
  border-radius: 6px;
  font-size: 12px;
  padding: 4px 10px;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-remove:hover {
  background: #fdecea;
  border-color: var(--error);
}
.change-divider {
  border: none;
  border-top: 1px solid var(--border);
  margin: 4px 0 16px;
}
.btn-add {
  margin-top: 8px;
  background: none;
  border: 1.5px dashed var(--border);
  color: var(--dark);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  padding: 10px 20px;
  cursor: pointer;
  width: 100%;
  transition: border-color 0.15s, background 0.15s;
}
.btn-add:hover {
  border-color: var(--dark);
  background: var(--grey);
}
</style>
