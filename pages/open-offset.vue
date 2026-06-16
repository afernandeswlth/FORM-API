<template>
  <div>
    <AppHeader title="Open Offset Account" />
    <SuccessOverlay v-if="submitted" :ref-id="submissionId" @reset="reset" />

    <div class="container">
      <p class="form-desc">
        Complete this form to open an offset account linked to your home loan.
      </p>

      <!-- Borrower count -->
      <div class="card">
        <div class="card-title">Number of Borrowers</div>
        <span class="toggle-label">How many borrowers are on this loan?</span>
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
      </div>

      <!-- Borrower details -->
      <div class="card" v-for="(b, i) in borrowers" :key="i">
        <div class="card-title">Borrower {{ i + 1 }}</div>
        <div class="field-row">
          <div class="field" :class="{ 'has-error': showErrors && !b.surname.trim() }">
            <label>Surname *</label>
            <input v-model="b.surname" type="text" placeholder="Last name" />
            <div v-if="showErrors && !b.surname.trim()" class="err-msg">Surname is required</div>
          </div>
          <div class="field" :class="{ 'has-error': showErrors && !b.given_names.trim() }">
            <label>Given Names *</label>
            <input v-model="b.given_names" type="text" placeholder="First and middle names" />
            <div v-if="showErrors && !b.given_names.trim()" class="err-msg">Given names are required</div>
          </div>
        </div>
        <div class="field-row">
          <div class="field" :class="{ 'has-error': showErrors && !b.customer_number.trim() }">
            <label>Customer Number *</label>
            <input v-model="b.customer_number" type="text" placeholder="e.g. 1234567" />
            <div v-if="showErrors && !b.customer_number.trim()" class="err-msg">Customer number is required</div>
          </div>
          <div class="field" />
        </div>
      </div>

      <!-- Linked account number -->
      <div class="card">
        <div class="card-title">Linked Account</div>
        <div class="field-row">
          <div class="field" :class="{ 'has-error': showErrors && !linkedAccountNumber.trim() }">
            <label>Linked Account Number *</label>
            <input v-model="linkedAccountNumber" type="text" placeholder="Loan account number to link offset to" />
            <div v-if="showErrors && !linkedAccountNumber.trim()" class="err-msg">Linked account number is required</div>
          </div>
        </div>
      </div>

      <!-- Authorisations -->
      <div class="card">
        <div class="card-title">Customer Authorisation</div>
        <div v-for="(b, i) in borrowers" :key="i" class="auth-card">
          <div class="auth-card-title">
            Authorisation – Borrower {{ i + 1 }}
            <span v-if="b.given_names || b.surname"> ({{ b.given_names }} {{ b.surname }})</span>
          </div>

          <div class="field-row">
            <div class="field" :class="{ 'has-error': showErrors && !auths[i].signed_date }">
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

      <!-- Error summary -->
      <div v-if="showErrors && hasErrors" class="err-msg" style="margin-bottom: 12px; font-size: 13px;">
        Please fix the errors above before submitting.
      </div>

      <!-- Submit -->
      <button class="btn-submit" :disabled="submitting" @click="submit">
        {{ submitting ? 'Submitting...' : 'Submit Form' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

useHead({ title: 'Open Offset Account – WLTH' })

// ── Types ──────────────────────────────────────────────────────────────────
interface Borrower {
  surname: string
  given_names: string
  customer_number: string
}

interface Auth {
  signed_date: string
}

// ── State ──────────────────────────────────────────────────────────────────
const borrowerCount = ref(1)
const linkedAccountNumber = ref('')
const showErrors = ref(false)
const submitting = ref(false)
const submitted = ref(false)
const submissionId = ref('')

function makeBorrower(): Borrower {
  return { surname: '', given_names: '', customer_number: '' }
}

function makeAuth(): Auth {
  return { signed_date: '' }
}

const borrowers = ref<Borrower[]>([makeBorrower()])
const auths = ref<Auth[]>([makeAuth()])
const sigs = ref<(string | null)[]>([null])

// ── Borrower count management ──────────────────────────────────────────────
function setBorrowerCount(n: number) {
  borrowerCount.value = n
}

watch(borrowerCount, (n) => {
  while (borrowers.value.length < n) {
    borrowers.value.push(makeBorrower())
    auths.value.push(makeAuth())
    sigs.value.push(null)
  }
  borrowers.value.splice(n)
  auths.value.splice(n)
  sigs.value.splice(n)
})

// ── Validation ─────────────────────────────────────────────────────────────
const hasErrors = computed(() => {
  if (!linkedAccountNumber.value.trim()) return true
  for (let i = 0; i < borrowerCount.value; i++) {
    const b = borrowers.value[i]
    if (!b.surname.trim() || !b.given_names.trim() || !b.customer_number.trim()) return true
    if (!auths.value[i].signed_date) return true
    if (!sigs.value[i]) return true
  }
  return false
})

// ── Submit ─────────────────────────────────────────────────────────────────
async function submit() {
  showErrors.value = true
  if (hasErrors.value) return

  submitting.value = true
  try {
    const payload = {
      borrower_count: borrowerCount.value,
      borrowers: borrowers.value.slice(0, borrowerCount.value),
      linked_account_number: linkedAccountNumber.value.trim(),
      authorisations: auths.value.slice(0, borrowerCount.value).map((a, i) => ({
        signed_date: a.signed_date,
        signature_base64: sigs.value[i] ?? '',
      })),
    }

    const res = await $fetch<{ id: string; status: string; created_at: string }>(
      '/api/open-offset/submit',
      { method: 'POST', body: payload }
    )

    submissionId.value = res.id
    submitted.value = true
  } catch (err) {
    alert('Submission failed. Please try again.')
    console.error(err)
  } finally {
    submitting.value = false
  }
}

// ── Reset ──────────────────────────────────────────────────────────────────
function reset() {
  borrowerCount.value = 1
  linkedAccountNumber.value = ''
  borrowers.value = [makeBorrower()]
  auths.value = [makeAuth()]
  sigs.value = [null]
  showErrors.value = false
  submitted.value = false
  submissionId.value = ''
}
</script>

<style scoped>
.form-desc {
  font-size: 14px;
  color: var(--muted);
  margin-bottom: 24px;
}
</style>
