<template>
  <div>
    <AppHeader title="Linked Account Nomination" />

    <SuccessOverlay
      v-if="submitted"
      :ref-id="submissionId"
      @reset="reset"
    />

    <div class="container">
      <!-- Borrower Count -->
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

      <!-- Borrower Details -->
      <div class="card">
        <div class="card-title">Borrower Details</div>
        <div v-for="(b, i) in borrowers" :key="i" style="margin-bottom: 20px;">
          <div class="auth-card-title">Borrower {{ i + 1 }}</div>
          <div class="field-row">
            <div class="field" :class="{ 'has-error': showErrors && !b.surname.trim() }">
              <label>Surname *</label>
              <input v-model="b.surname" type="text" placeholder="e.g. Smith" />
              <div v-if="showErrors && !b.surname.trim()" class="err-msg">Required</div>
            </div>
            <div class="field" :class="{ 'has-error': showErrors && !b.given_names.trim() }">
              <label>Given Name(s) *</label>
              <input v-model="b.given_names" type="text" placeholder="e.g. John Michael" />
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
            <input v-model="loanAccountNumber" type="text" placeholder="e.g. 1234567890" />
            <div v-if="showErrors && !loanAccountNumber.trim()" class="err-msg">Required</div>
          </div>
        </div>
      </div>

      <!-- Linked Bank Accounts -->
      <div class="card">
        <div class="card-title">Linked Bank Accounts</div>
        <div v-if="showErrors && linkedAccounts.length === 0" class="err-msg" style="margin-bottom: 12px;">
          At least one linked account is required.
        </div>

        <div
          v-for="(acc, ai) in linkedAccounts"
          :key="ai"
          class="auth-card"
          style="margin-bottom: 16px;"
        >
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <div class="auth-card-title" style="margin-bottom: 0;">Account {{ ai + 1 }}</div>
            <button
              v-if="linkedAccounts.length > 1"
              type="button"
              class="btn-remove"
              @click="removeAccount(ai)"
            >
              Remove
            </button>
          </div>

          <div class="field-row">
            <div class="field" :class="{ 'has-error': showErrors && !acc.bank_name.trim() }">
              <label>Bank Name *</label>
              <input v-model="acc.bank_name" type="text" placeholder="e.g. Commonwealth Bank" />
              <div v-if="showErrors && !acc.bank_name.trim()" class="err-msg">Required</div>
            </div>
            <div class="field" :class="{ 'has-error': showErrors && !acc.account_name.trim() }">
              <label>Account Name *</label>
              <input v-model="acc.account_name" type="text" placeholder="e.g. John Smith" />
              <div v-if="showErrors && !acc.account_name.trim()" class="err-msg">Required</div>
            </div>
          </div>

          <div class="field-row">
            <div class="field" :class="{ 'has-error': showErrors && bsbError(acc.bsb) }">
              <label>BSB *</label>
              <input
                v-model="acc.bsb"
                type="text"
                placeholder="000-000"
                maxlength="7"
                @input="formatBsb(ai, $event)"
              />
              <div v-if="showErrors && bsbError(acc.bsb)" class="err-msg">{{ bsbError(acc.bsb) }}</div>
            </div>
            <div class="field" :class="{ 'has-error': showErrors && !acc.account_number.trim() }">
              <label>Account Number *</label>
              <input v-model="acc.account_number" type="text" placeholder="e.g. 12345678" />
              <div v-if="showErrors && !acc.account_number.trim()" class="err-msg">Required</div>
            </div>
          </div>

          <!-- Bank Statement Upload -->
          <div class="field" :class="{ 'has-error': showErrors && !acc.bank_statement_data }">
            <label>Bank Statement * <span style="font-weight:400;color:var(--muted)">(PDF, JPG or PNG)</span></label>
            <div v-if="acc.bank_statement_filename" class="file-display">
              <span class="file-name">{{ acc.bank_statement_filename }}</span>
              <button type="button" class="btn-file-remove" @click="removeStatement(ai)">Remove</button>
            </div>
            <div v-else>
              <label :for="`stmt-${ai}`" class="btn-file-upload">Choose File</label>
              <input
                :id="`stmt-${ai}`"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                style="display: none;"
                @change="onStatementUpload(ai, $event)"
              />
            </div>
            <div v-if="showErrors && !acc.bank_statement_data" class="err-msg">Bank statement is required</div>
          </div>
        </div>

        <button
          v-if="linkedAccounts.length < 4"
          type="button"
          class="btn-add"
          @click="addAccount"
        >
          + Add Another Account
        </button>
      </div>

      <!-- Authorisations -->
      <div class="card">
        <div class="card-title">Customer Authorisation</div>
        <p style="font-size: 13px; color: var(--muted); margin-bottom: 18px;">
          By signing below, each borrower authorises WLTH to link the nominated bank account(s) to their loan.
        </p>

        <div v-for="(b, i) in borrowers" :key="i" class="auth-card" style="margin-bottom: 16px;">
          <div class="auth-card-title">
            Borrower {{ i + 1 }} – {{ fullName(b) || 'Name not yet entered' }}
          </div>

          <div class="field-row">
            <div class="field">
              <label>Home Contact (optional)</label>
              <input v-model="auths[i].home_contact" type="tel" placeholder="e.g. 02 9999 9999" />
            </div>
            <div class="field">
              <label>Work Contact (optional)</label>
              <input v-model="auths[i].work_contact" type="tel" placeholder="e.g. 02 8888 8888" />
            </div>
          </div>

          <div class="field-row">
            <div class="field" :class="{ 'has-error': showErrors && !auths[i].signed_date }">
              <label>Date *</label>
              <input v-model="auths[i].signed_date" type="date" />
              <div v-if="showErrors && !auths[i].signed_date" class="err-msg">Date required</div>
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
        class="btn-submit"
        :disabled="submitting"
        @click="handleSubmit"
      >
        {{ submitting ? 'Submitting…' : 'Submit Linked Account Nomination' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

definePageMeta({ layout: false })
useHead({ title: 'Linked Account Nomination | WLTH' })

// ---- Types ----
interface Borrower {
  surname: string
  given_names: string
}

interface LinkedAccount {
  bank_name: string
  account_name: string
  bsb: string
  account_number: string
  bank_statement_data: string | null
  bank_statement_filename: string | null
}

interface Auth {
  home_contact: string
  work_contact: string
  signed_date: string
}

// ---- State ----
const borrowerCount = ref(1)
const loanAccountNumber = ref('')
const showErrors = ref(false)
const submitting = ref(false)
const submitted = ref(false)
const submissionId = ref('')
const submitError = ref('')

function makeBorrower(): Borrower {
  return { surname: '', given_names: '' }
}

function makeAccount(): LinkedAccount {
  return {
    bank_name: '',
    account_name: '',
    bsb: '',
    account_number: '',
    bank_statement_data: null,
    bank_statement_filename: null,
  }
}

function makeAuth(): Auth {
  return { home_contact: '', work_contact: '', signed_date: '' }
}

const borrowers = reactive<Borrower[]>([makeBorrower()])
const linkedAccounts = reactive<LinkedAccount[]>([makeAccount()])
const auths = reactive<Auth[]>([makeAuth()])
const sigs = reactive<(string | null)[]>([null])

// ---- Borrower count ----
function setBorrowerCount(n: number) {
  borrowerCount.value = n
  while (borrowers.length < n) {
    borrowers.push(makeBorrower())
    auths.push(makeAuth())
    sigs.push(null)
  }
  while (borrowers.length > n) {
    borrowers.pop()
    auths.pop()
    sigs.pop()
  }
}

watch(borrowerCount, (n) => setBorrowerCount(n))

// ---- Linked accounts ----
function addAccount() {
  if (linkedAccounts.length < 4) linkedAccounts.push(makeAccount())
}

function removeAccount(i: number) {
  linkedAccounts.splice(i, 1)
}

// ---- BSB formatting ----
function formatBsb(i: number, event: Event) {
  const input = event.target as HTMLInputElement
  let raw = input.value.replace(/\D/g, '').slice(0, 6)
  if (raw.length > 3) raw = raw.slice(0, 3) + '-' + raw.slice(3)
  linkedAccounts[i].bsb = raw
}

function bsbError(bsb: string): string | null {
  if (!bsb.trim()) return 'Required'
  if (!/^\d{3}-\d{3}$/.test(bsb)) return 'Must be in format 000-000'
  return null
}

// ---- File upload ----
function onStatementUpload(i: number, event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    linkedAccounts[i].bank_statement_data = reader.result as string
    linkedAccounts[i].bank_statement_filename = file.name
  }
  reader.readAsDataURL(file)
  // Reset so re-selecting same file triggers change again
  input.value = ''
}

function removeStatement(i: number) {
  linkedAccounts[i].bank_statement_data = null
  linkedAccounts[i].bank_statement_filename = null
}

// ---- Helpers ----
function fullName(b: Borrower): string {
  return [b.given_names, b.surname].filter(Boolean).join(' ')
}

// ---- Validation ----
function validate(): boolean {
  if (!loanAccountNumber.value.trim()) return false

  for (const b of borrowers) {
    if (!b.surname.trim() || !b.given_names.trim()) return false
  }

  if (linkedAccounts.length === 0) return false
  for (const acc of linkedAccounts) {
    if (
      !acc.bank_name.trim() ||
      !acc.account_name.trim() ||
      bsbError(acc.bsb) !== null ||
      !acc.account_number.trim() ||
      !acc.bank_statement_data
    ) return false
  }

  for (let i = 0; i < borrowers.length; i++) {
    if (!auths[i].signed_date) return false
    if (!sigs[i]) return false
  }

  return true
}

// ---- Submit ----
async function handleSubmit() {
  showErrors.value = true
  if (!validate()) return

  submitting.value = true
  submitError.value = ''

  try {
    const payload = {
      loan_account_number: loanAccountNumber.value.trim(),
      borrowers: borrowers.map(b => ({ surname: b.surname.trim(), given_names: b.given_names.trim() })),
      linked_accounts: linkedAccounts.map(acc => ({
        bank_name: acc.bank_name.trim(),
        account_name: acc.account_name.trim(),
        bsb: acc.bsb.trim(),
        account_number: acc.account_number.trim(),
        bank_statement_data: acc.bank_statement_data,
        bank_statement_filename: acc.bank_statement_filename,
      })),
      authorisations: borrowers.map((_, i) => ({
        home_contact: auths[i].home_contact.trim(),
        work_contact: auths[i].work_contact.trim(),
        signed_date: auths[i].signed_date,
        signature_base64: sigs[i],
      })),
    }

    const res = await fetch('/api/linked-account/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error((err as any)?.message ?? `Server error ${res.status}`)
    }

    const data = await res.json() as { id: string; status: string; created_at: string }
    submissionId.value = data.id
    submitted.value = true
  } catch (e: unknown) {
    submitError.value = e instanceof Error ? e.message : 'Submission failed. Please try again.'
  } finally {
    submitting.value = false
  }
}

// ---- Reset ----
function reset() {
  borrowerCount.value = 1
  loanAccountNumber.value = ''
  showErrors.value = false
  submitted.value = false
  submissionId.value = ''
  submitError.value = ''

  borrowers.splice(0, borrowers.length, makeBorrower())
  linkedAccounts.splice(0, linkedAccounts.length, makeAccount())
  auths.splice(0, auths.length, makeAuth())
  sigs.splice(0, sigs.length, null)
}
</script>

<style scoped>
.btn-add {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 18px; border: 1.5px dashed var(--border);
  border-radius: 8px; background: none; color: var(--dark);
  font-size: 13px; font-weight: 600; cursor: pointer; transition: border-color 0.2s;
}
.btn-add:hover { border-color: var(--dark); }

.btn-remove {
  padding: 5px 12px; border: 1px solid var(--error);
  border-radius: 6px; background: none; color: var(--error);
  font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.15s;
}
.btn-remove:hover { background: var(--error); color: #fff; }

.btn-file-upload {
  display: inline-block; padding: 8px 16px;
  border: 1.5px solid var(--border); border-radius: 8px;
  background: #fff; color: var(--dark); font-size: 13px;
  font-weight: 600; cursor: pointer; transition: border-color 0.2s;
}
.btn-file-upload:hover { border-color: var(--dark); }

.file-display {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border: 1.5px solid var(--border);
  border-radius: 8px; background: #f9f9f9;
}
.file-name {
  flex: 1; font-size: 13px; color: var(--text);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.btn-file-remove {
  flex-shrink: 0; padding: 3px 10px;
  border: 1px solid var(--border); border-radius: 5px;
  background: none; color: var(--muted); font-size: 11px; cursor: pointer;
}
.btn-file-remove:hover { border-color: var(--error); color: var(--error); }
</style>
