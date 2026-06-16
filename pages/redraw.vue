<template>
  <div>
    <AppHeader title="Redraw Request" />
    <SuccessOverlay v-if="submitted" :ref-id="submissionId" @reset="reset" />

    <div class="container">
      <p class="form-desc">
        Use this form to request access to available redraw funds from your WLTH loan account.
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
            {{ n }}
          </label>
        </div>

        <!-- Borrower Name Fields -->
        <div v-for="(b, i) in borrowers" :key="i">
          <div class="auth-card-title" style="font-size:13px;font-weight:700;color:var(--dark);margin-bottom:10px;margin-top:8px;">
            Borrower {{ i + 1 }}
          </div>
          <div class="field-row">
            <div class="field" :class="{ 'has-error': showErrors && !b.surname.trim() }">
              <label>Surname *</label>
              <input v-model="b.surname" type="text" placeholder="Smith" />
              <div v-if="showErrors && !b.surname.trim()" class="err-msg">Required</div>
            </div>
            <div class="field" :class="{ 'has-error': showErrors && !b.given_names.trim() }">
              <label>Given Name(s) *</label>
              <input v-model="b.given_names" type="text" placeholder="John" />
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

      <!-- Redraw Destination -->
      <div class="card">
        <div class="card-title">Redraw Destination</div>

        <div class="field-row">
          <div class="field" :class="{ 'has-error': showErrors && !toAccountName.trim() }">
            <label>To Account Name *</label>
            <input v-model="toAccountName" type="text" placeholder="e.g. John Smith" />
            <div v-if="showErrors && !toAccountName.trim()" class="err-msg">Required</div>
          </div>
        </div>

        <div class="field-row">
          <div class="field" :class="{ 'has-error': showErrors && !bsbValid }">
            <label>BSB *</label>
            <input
              v-model="bsb"
              type="text"
              placeholder="000-000"
              maxlength="7"
              @input="formatBsb"
            />
            <div v-if="showErrors && !bsbValid" class="err-msg">
              {{ bsb.trim() ? 'BSB must be in format 000-000' : 'Required' }}
            </div>
          </div>
          <div class="field" :class="{ 'has-error': showErrors && !accountNumberValid }">
            <label>Account Number *</label>
            <input
              v-model="accountNumber"
              type="text"
              placeholder="Digits only"
              @input="accountNumber = accountNumber.replace(/\D/g, '')"
            />
            <div v-if="showErrors && !accountNumberValid" class="err-msg">
              {{ accountNumber.trim() ? 'Digits only' : 'Required' }}
            </div>
          </div>
        </div>

        <div class="field-row">
          <div class="field amount-field" :class="{ 'has-error': showErrors && !redrawAmountValid }">
            <label>Redraw Amount *</label>
            <div class="amount-wrap">
              <span class="dollar-prefix">$</span>
              <input
                v-model.number="redrawAmount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                class="amount-input"
              />
            </div>
            <div v-if="showErrors && !redrawAmountValid" class="err-msg">
              {{ redrawAmount !== null && redrawAmount <= 0 ? 'Amount must be greater than $0' : 'Required' }}
            </div>
          </div>
        </div>

        <!-- Large Amount Warning Banner -->
        <div v-if="redrawAmount !== null && redrawAmount >= 100000" class="large-amount-banner">
          <span class="banner-icon">&#9888;</span>
          Amounts of $100,000 or more require WLTH approval
        </div>
      </div>

      <!-- Redraw Reason -->
      <div class="card">
        <div class="card-title">Redraw Reason</div>
        <div class="field" :class="{ 'has-error': showErrors && !redrawReason.trim() }">
          <label>What will the funds be used for? *</label>
          <textarea
            v-model="redrawReason"
            rows="4"
            placeholder="Please describe what the redrawn funds will be used for..."
          />
          <div v-if="showErrors && !redrawReason.trim()" class="err-msg">Required</div>
        </div>
      </div>

      <!-- Authorisations -->
      <div class="card">
        <div class="card-title">Customer Authorisation</div>
        <div v-for="(b, i) in borrowers" :key="i" class="auth-card">
          <div class="auth-card-title">
            Borrower {{ i + 1 }} – {{ b.given_names || '—' }} {{ b.surname || '—' }}
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
            @update:value="v => sigs[i] = v"
          />
          <div v-if="showErrors && !sigs[i]" class="err-msg" style="margin-top:4px;">
            Signature required
          </div>
        </div>
      </div>

      <!-- Submit -->
      <div class="card">
        <div v-if="submitError" class="err-msg" style="margin-bottom:12px;font-size:13px;">
          {{ submitError }}
        </div>
        <button class="btn-submit" :disabled="submitting" @click="submit">
          {{ submitting ? 'Submitting…' : 'Submit Redraw Request' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

useHead({ title: 'Redraw Request – WLTH' })

// --- Borrower count & data ---
const borrowerCount = ref(1)

interface BorrowerField { surname: string; given_names: string }
interface AuthField { signed_date: string }

const borrowers = ref<BorrowerField[]>([{ surname: '', given_names: '' }])
const auths = ref<AuthField[]>([{ signed_date: '' }])
const sigs = ref<(string | null)[]>([null])

function setBorrowerCount(n: number) {
  borrowerCount.value = n
  while (borrowers.value.length < n) {
    borrowers.value.push({ surname: '', given_names: '' })
    auths.value.push({ signed_date: '' })
    sigs.value.push(null)
  }
  if (borrowers.value.length > n) {
    borrowers.value = borrowers.value.slice(0, n)
    auths.value = auths.value.slice(0, n)
    sigs.value = sigs.value.slice(0, n)
  }
}

watch(borrowerCount, (n) => setBorrowerCount(n))

// --- Loan details ---
const loanAccountNumber = ref('')

// --- Redraw destination ---
const toAccountName = ref('')
const bsb = ref('')
const accountNumber = ref('')
const redrawAmount = ref<number | null>(null)

function formatBsb(e: Event) {
  const input = e.target as HTMLInputElement
  let raw = input.value.replace(/\D/g, '').slice(0, 6)
  if (raw.length > 3) {
    raw = raw.slice(0, 3) + '-' + raw.slice(3)
  }
  bsb.value = raw
}

const bsbValid = computed(() => /^\d{3}-\d{3}$/.test(bsb.value))
const accountNumberValid = computed(() => /^\d+$/.test(accountNumber.value) && accountNumber.value.trim() !== '')
const redrawAmountValid = computed(() => redrawAmount.value !== null && redrawAmount.value > 0)

// --- Redraw reason ---
const redrawReason = ref('')

// --- Form state ---
const showErrors = ref(false)
const submitting = ref(false)
const submitted = ref(false)
const submissionId = ref('')
const submitError = ref('')

// --- Validation ---
function isValid(): boolean {
  // Borrowers
  for (const b of borrowers.value) {
    if (!b.surname.trim() || !b.given_names.trim()) return false
  }
  // Loan
  if (!loanAccountNumber.value.trim()) return false
  // Destination
  if (!toAccountName.value.trim()) return false
  if (!bsbValid.value) return false
  if (!accountNumberValid.value) return false
  if (!redrawAmountValid.value) return false
  // Reason
  if (!redrawReason.value.trim()) return false
  // Authorisations
  for (let i = 0; i < borrowers.value.length; i++) {
    if (!auths.value[i].signed_date) return false
    if (!sigs.value[i]) return false
  }
  return true
}

// --- Submit ---
async function submit() {
  showErrors.value = true
  if (!isValid()) return

  submitting.value = true
  submitError.value = ''

  const payload = {
    borrowers: borrowers.value.map(b => ({ surname: b.surname.trim(), given_names: b.given_names.trim() })),
    loan_account_number: loanAccountNumber.value.trim(),
    redraw_destination: {
      to_account_name: toAccountName.value.trim(),
      bsb: bsb.value.trim(),
      account_number: accountNumber.value.trim(),
      redraw_amount: redrawAmount.value!,
      large_amount: redrawAmount.value! >= 100000,
    },
    redraw_reason: redrawReason.value.trim(),
    authorisations: auths.value.map((a, i) => ({
      signed_date: a.signed_date,
      signature_base64: sigs.value[i]!,
    })),
  }

  try {
    const res = await fetch('/api/redraw/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.message ?? 'Submission failed')
    submissionId.value = data.id
    submitted.value = true
  } catch (err: any) {
    submitError.value = err?.message ?? 'An unexpected error occurred. Please try again.'
  } finally {
    submitting.value = false
  }
}

// --- Reset ---
function reset() {
  showErrors.value = false
  submitted.value = false
  submissionId.value = ''
  submitError.value = ''
  borrowerCount.value = 1
  borrowers.value = [{ surname: '', given_names: '' }]
  auths.value = [{ signed_date: '' }]
  sigs.value = [null]
  loanAccountNumber.value = ''
  toAccountName.value = ''
  bsb.value = ''
  accountNumber.value = ''
  redrawAmount.value = null
  redrawReason.value = ''
}
</script>

<style scoped>
.amount-field .amount-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  transition: border-color 0.2s;
}
.amount-field.has-error .amount-wrap {
  border-color: var(--error);
}
.amount-wrap:focus-within {
  border-color: var(--dark);
}
.dollar-prefix {
  padding: 10px 10px 10px 12px;
  font-size: 14px;
  color: var(--muted);
  background: #fff;
  user-select: none;
  line-height: 1;
}
.amount-input {
  flex: 1;
  border: none !important;
  outline: none !important;
  padding: 10px 12px 10px 0;
  font-size: 14px;
  color: var(--text);
  background: transparent;
  font-family: inherit;
  -moz-appearance: textfield;
}
.amount-input::-webkit-outer-spin-button,
.amount-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.large-amount-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff8e1;
  border: 1.5px solid #f9a825;
  border-radius: 8px;
  padding: 12px 16px;
  color: #7c5200;
  font-size: 13.5px;
  font-weight: 600;
  margin-top: 8px;
}
.banner-icon {
  font-size: 18px;
  color: #f9a825;
  flex-shrink: 0;
}
</style>
