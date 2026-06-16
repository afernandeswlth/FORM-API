import { _ as __nuxt_component_0, a as __nuxt_component_1, b as __nuxt_component_2 } from './SignatureCanvas-DQrKARAA.mjs';
import { defineComponent, ref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderStyle } from 'vue/server-renderer';
import { u as useHead } from './v3-CkUdgLcY.mjs';
import { _ as _export_sfc } from './server.mjs';
import './nuxt-link-YhNEZhYT.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "direct-debit",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({ title: "Direct Debit Request \u2013 WLTH" });
    const frequencyOptions = [
      { value: "weekly", label: "Weekly" },
      { value: "fortnightly", label: "Fortnightly" },
      { value: "monthly", label: "Monthly" }
    ];
    const amountOptions = [
      { value: "minimum", label: "Minimum Repayment" },
      { value: "fixed", label: "Fixed Amount" },
      { value: "other", label: "Other Amount" }
    ];
    const borrowerCount = ref(1);
    const loanAccountNumber = ref("");
    const showErrors = ref(false);
    const submitting = ref(false);
    const submitted = ref(false);
    const submissionId = ref("");
    const apiError = ref("");
    function makeBorrower() {
      return { surname: "", given_names: "" };
    }
    function makeAccount() {
      return {
        bank_name: "",
        account_name: "",
        bsb: "",
        account_number: "",
        payment_frequency: "monthly",
        amount_type: "minimum",
        fixed_amount: void 0,
        bank_statement_base64: "",
        bank_statement_filename: ""
      };
    }
    function makeAuth() {
      return { home_contact: "", work_contact: "", signed_date: "" };
    }
    const borrowers = ref([makeBorrower()]);
    const accounts = ref([makeAccount()]);
    const auths = ref([makeAuth()]);
    const sigs = ref([null]);
    function isBsbValid(bsb) {
      return /^\d{3}-\d{3}$/.test(bsb);
    }
    function reset() {
      borrowerCount.value = 1;
      loanAccountNumber.value = "";
      borrowers.value = [makeBorrower()];
      accounts.value = [makeAccount()];
      auths.value = [makeAuth()];
      sigs.value = [null];
      showErrors.value = false;
      submitted.value = false;
      submissionId.value = "";
      apiError.value = "";
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AppHeader = __nuxt_component_0;
      const _component_SuccessOverlay = __nuxt_component_1;
      const _component_SignatureCanvas = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-b6582790>`);
      _push(ssrRenderComponent(_component_AppHeader, { title: "Direct Debit Request" }, null, _parent));
      if (submitted.value) {
        _push(ssrRenderComponent(_component_SuccessOverlay, {
          "ref-id": submissionId.value,
          onReset: reset
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="container" data-v-b6582790><div class="card" data-v-b6582790><div class="card-title" data-v-b6582790>Number of Borrowers</div><div class="borrower-selector" data-v-b6582790><!--[-->`);
      ssrRenderList(4, (n) => {
        _push(`<label class="${ssrRenderClass({ active: borrowerCount.value === n })}" data-v-b6582790><input type="radio" name="borrower-count"${ssrRenderAttr("value", n)}${ssrIncludeBooleanAttr(borrowerCount.value === n) ? " checked" : ""} data-v-b6582790> ${ssrInterpolate(n)}</label>`);
      });
      _push(`<!--]--></div></div><div class="card" data-v-b6582790><div class="card-title" data-v-b6582790>Borrower Details</div><!--[-->`);
      ssrRenderList(borrowers.value, (b, i) => {
        _push(`<div data-v-b6582790><div class="borrower-heading" data-v-b6582790>Borrower ${ssrInterpolate(i + 1)}</div><div class="field-row" data-v-b6582790><div class="${ssrRenderClass([{ "has-error": showErrors.value && !b.surname.trim() }, "field"])}" data-v-b6582790><label data-v-b6582790>Surname *</label><input${ssrRenderAttr("value", b.surname)} type="text" placeholder="Smith" data-v-b6582790>`);
        if (showErrors.value && !b.surname.trim()) {
          _push(`<div class="err-msg" data-v-b6582790>Required</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="${ssrRenderClass([{ "has-error": showErrors.value && !b.given_names.trim() }, "field"])}" data-v-b6582790><label data-v-b6582790>Given Names *</label><input${ssrRenderAttr("value", b.given_names)} type="text" placeholder="Jane" data-v-b6582790>`);
        if (showErrors.value && !b.given_names.trim()) {
          _push(`<div class="err-msg" data-v-b6582790>Required</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div>`);
      });
      _push(`<!--]--></div><div class="card" data-v-b6582790><div class="card-title" data-v-b6582790>Loan Details</div><div class="field-row" data-v-b6582790><div class="${ssrRenderClass([{ "has-error": showErrors.value && !loanAccountNumber.value.trim() }, "field"])}" data-v-b6582790><label data-v-b6582790>Loan Account Number *</label><input${ssrRenderAttr("value", loanAccountNumber.value)} type="text" placeholder="e.g. 1234567" data-v-b6582790>`);
      if (showErrors.value && !loanAccountNumber.value.trim()) {
        _push(`<div class="err-msg" data-v-b6582790>Required</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div><div class="card" data-v-b6582790><div class="card-title" data-v-b6582790>Direct Debit Account(s)</div>`);
      if (showErrors.value && accounts.value.length === 0) {
        _push(`<div class="err-msg" style="${ssrRenderStyle({ "margin-bottom": "12px" })}" data-v-b6582790> At least one direct debit account is required </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(accounts.value, (acc, ai) => {
        _push(`<div class="account-block" data-v-b6582790><div class="account-block-header" data-v-b6582790><span class="account-block-num" data-v-b6582790>Account ${ssrInterpolate(ai + 1)}</span>`);
        if (accounts.value.length > 1) {
          _push(`<button type="button" class="btn-remove" data-v-b6582790>Remove</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="field-row" data-v-b6582790><div class="${ssrRenderClass([{ "has-error": showErrors.value && !acc.bank_name.trim() }, "field"])}" data-v-b6582790><label data-v-b6582790>Bank Name *</label><input${ssrRenderAttr("value", acc.bank_name)} type="text" placeholder="e.g. Commonwealth Bank" data-v-b6582790>`);
        if (showErrors.value && !acc.bank_name.trim()) {
          _push(`<div class="err-msg" data-v-b6582790>Required</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="${ssrRenderClass([{ "has-error": showErrors.value && !acc.account_name.trim() }, "field"])}" data-v-b6582790><label data-v-b6582790>Account Name *</label><input${ssrRenderAttr("value", acc.account_name)} type="text" placeholder="e.g. Jane Smith" data-v-b6582790>`);
        if (showErrors.value && !acc.account_name.trim()) {
          _push(`<div class="err-msg" data-v-b6582790>Required</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="field-row" data-v-b6582790><div class="${ssrRenderClass([{ "has-error": showErrors.value && !isBsbValid(acc.bsb) }, "field"])}" data-v-b6582790><label data-v-b6582790>BSB *</label><input${ssrRenderAttr("value", acc.bsb)} type="text" placeholder="000-000" maxlength="7" data-v-b6582790>`);
        if (showErrors.value && !isBsbValid(acc.bsb)) {
          _push(`<div class="err-msg" data-v-b6582790>Enter a valid BSB (e.g. 062-000)</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="${ssrRenderClass([{ "has-error": showErrors.value && !acc.account_number.trim() }, "field"])}" data-v-b6582790><label data-v-b6582790>Account Number *</label><input${ssrRenderAttr("value", acc.account_number)} type="text" placeholder="e.g. 12345678" data-v-b6582790>`);
        if (showErrors.value && !acc.account_number.trim()) {
          _push(`<div class="err-msg" data-v-b6582790>Required</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><span class="toggle-label" data-v-b6582790>Payment Frequency *</span><div class="toggle-row" data-v-b6582790><!--[-->`);
        ssrRenderList(frequencyOptions, (opt) => {
          _push(`<label class="toggle-opt" data-v-b6582790><input type="radio"${ssrRenderAttr("name", `freq-${ai}`)}${ssrRenderAttr("value", opt.value)}${ssrIncludeBooleanAttr(acc.payment_frequency === opt.value) ? " checked" : ""} data-v-b6582790><span data-v-b6582790>${ssrInterpolate(opt.label)}</span></label>`);
        });
        _push(`<!--]--></div><span class="toggle-label" data-v-b6582790>Amount Type *</span><div class="toggle-row" data-v-b6582790><!--[-->`);
        ssrRenderList(amountOptions, (opt) => {
          _push(`<label class="toggle-opt" data-v-b6582790><input type="radio"${ssrRenderAttr("name", `amt-${ai}`)}${ssrRenderAttr("value", opt.value)}${ssrIncludeBooleanAttr(acc.amount_type === opt.value) ? " checked" : ""} data-v-b6582790><span data-v-b6582790>${ssrInterpolate(opt.label)}</span></label>`);
        });
        _push(`<!--]--></div>`);
        if (acc.amount_type === "fixed" || acc.amount_type === "other") {
          _push(`<div class="field-row" data-v-b6582790><div class="${ssrRenderClass([{ "has-error": showErrors.value && !(acc.fixed_amount && acc.fixed_amount > 0) }, "field amount-field"])}" data-v-b6582790><label data-v-b6582790>${ssrInterpolate(acc.amount_type === "fixed" ? "Fixed Amount" : "Other Amount")} ($) *</label><div class="dollar-wrap" data-v-b6582790><span class="dollar-sign" data-v-b6582790>$</span><input${ssrRenderAttr("value", acc.fixed_amount)} type="number" min="0.01" step="0.01" placeholder="0.00" class="dollar-input" data-v-b6582790></div>`);
          if (showErrors.value && !(acc.fixed_amount && acc.fixed_amount > 0)) {
            _push(`<div class="err-msg" data-v-b6582790> Amount must be greater than $0 </div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="${ssrRenderClass([{ "has-error": showErrors.value && !acc.bank_statement_base64 }, "field"])}" data-v-b6582790><label data-v-b6582790>Bank Statement * <span class="field-hint" data-v-b6582790>(PDF, JPG or PNG \u2013 max 10 MB)</span></label><div class="${ssrRenderClass([{ "file-drop--filled": !!acc.bank_statement_filename }, "file-drop"])}" data-v-b6582790><input type="file" accept=".pdf,.jpg,.jpeg,.png" class="file-input" data-v-b6582790>`);
        if (acc.bank_statement_filename) {
          _push(`<div class="file-name" data-v-b6582790>${ssrInterpolate(acc.bank_statement_filename)}</div>`);
        } else {
          _push(`<div class="file-placeholder" data-v-b6582790>Click or drag to upload bank statement</div>`);
        }
        _push(`</div>`);
        if (showErrors.value && !acc.bank_statement_base64) {
          _push(`<div class="err-msg" data-v-b6582790>Bank statement is required</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (ai < accounts.value.length - 1) {
          _push(`<hr class="account-divider" data-v-b6582790>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]-->`);
      if (accounts.value.length < 4) {
        _push(`<button type="button" class="btn-add" data-v-b6582790>+ Add Another Account</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="card" data-v-b6582790><div class="card-title" data-v-b6582790>Customer Authorisation</div><p class="auth-note" data-v-b6582790> By signing below, I/we authorise WLTH Lend Pty Ltd to debit the nominated account(s) in accordance with the instructions above and the Direct Debit Request Service Agreement. </p><!--[-->`);
      ssrRenderList(borrowers.value, (b, i) => {
        _push(`<div class="auth-card" data-v-b6582790><div class="auth-card-title" data-v-b6582790>Borrower ${ssrInterpolate(i + 1)} \u2013 ${ssrInterpolate(b.given_names || "...")} ${ssrInterpolate(b.surname || "")}</div><div class="field-row" data-v-b6582790><div class="field" data-v-b6582790><label data-v-b6582790>Home Contact (optional)</label><input${ssrRenderAttr("value", auths.value[i].home_contact)} type="tel" placeholder="e.g. 02 9000 0000" data-v-b6582790></div><div class="field" data-v-b6582790><label data-v-b6582790>Work Contact (optional)</label><input${ssrRenderAttr("value", auths.value[i].work_contact)} type="tel" placeholder="e.g. 02 9000 0001" data-v-b6582790></div></div><div class="field-row" data-v-b6582790><div class="${ssrRenderClass([{ "has-error": showErrors.value && !auths.value[i].signed_date }, "field"])}" data-v-b6582790><label data-v-b6582790>Date *</label><input${ssrRenderAttr("value", auths.value[i].signed_date)} type="date" data-v-b6582790>`);
        if (showErrors.value && !auths.value[i].signed_date) {
          _push(`<div class="err-msg" data-v-b6582790>Required</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
        _push(ssrRenderComponent(_component_SignatureCanvas, {
          error: showErrors.value && !sigs.value[i],
          "onUpdate:value": (v) => sigs.value[i] = v
        }, null, _parent));
        _push(`</div>`);
      });
      _push(`<!--]--></div>`);
      if (apiError.value) {
        _push(`<div class="err-msg" style="${ssrRenderStyle({ "margin-bottom": "12px", "font-size": "13px" })}" data-v-b6582790>${ssrInterpolate(apiError.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="btn-submit"${ssrIncludeBooleanAttr(submitting.value) ? " disabled" : ""} data-v-b6582790>${ssrInterpolate(submitting.value ? "Submitting\u2026" : "Submit Direct Debit Request")}</button></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/direct-debit.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const directDebit = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b6582790"]]);

export { directDebit as default };
//# sourceMappingURL=direct-debit-BdwZuWHm.mjs.map
