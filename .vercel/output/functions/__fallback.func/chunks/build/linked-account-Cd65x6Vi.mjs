import { _ as __nuxt_component_0, a as __nuxt_component_1, b as __nuxt_component_2 } from './SignatureCanvas-DQrKARAA.mjs';
import { defineComponent, ref, reactive, watch, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseEqual, ssrInterpolate, ssrRenderStyle } from 'vue/server-renderer';
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
  __name: "linked-account",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({ title: "Linked Account Nomination | WLTH" });
    const borrowerCount = ref(1);
    const loanAccountNumber = ref("");
    const showErrors = ref(false);
    const submitting = ref(false);
    const submitted = ref(false);
    const submissionId = ref("");
    const submitError = ref("");
    function makeBorrower() {
      return { surname: "", given_names: "" };
    }
    function makeAccount() {
      return {
        bank_name: "",
        account_name: "",
        bsb: "",
        account_number: "",
        bank_statement_data: null,
        bank_statement_filename: null
      };
    }
    function makeAuth() {
      return { home_contact: "", work_contact: "", signed_date: "" };
    }
    const borrowers = reactive([makeBorrower()]);
    const linkedAccounts = reactive([makeAccount()]);
    const auths = reactive([makeAuth()]);
    const sigs = reactive([null]);
    function setBorrowerCount(n) {
      borrowerCount.value = n;
      while (borrowers.length < n) {
        borrowers.push(makeBorrower());
        auths.push(makeAuth());
        sigs.push(null);
      }
      while (borrowers.length > n) {
        borrowers.pop();
        auths.pop();
        sigs.pop();
      }
    }
    watch(borrowerCount, (n) => setBorrowerCount(n));
    function bsbError(bsb) {
      if (!bsb.trim()) return "Required";
      if (!/^\d{3}-\d{3}$/.test(bsb)) return "Must be in format 000-000";
      return null;
    }
    function fullName(b) {
      return [b.given_names, b.surname].filter(Boolean).join(" ");
    }
    function reset() {
      borrowerCount.value = 1;
      loanAccountNumber.value = "";
      showErrors.value = false;
      submitted.value = false;
      submissionId.value = "";
      submitError.value = "";
      borrowers.splice(0, borrowers.length, makeBorrower());
      linkedAccounts.splice(0, linkedAccounts.length, makeAccount());
      auths.splice(0, auths.length, makeAuth());
      sigs.splice(0, sigs.length, null);
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AppHeader = __nuxt_component_0;
      const _component_SuccessOverlay = __nuxt_component_1;
      const _component_SignatureCanvas = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-8b623b34>`);
      _push(ssrRenderComponent(_component_AppHeader, { title: "Linked Account Nomination" }, null, _parent));
      if (submitted.value) {
        _push(ssrRenderComponent(_component_SuccessOverlay, {
          "ref-id": submissionId.value,
          onReset: reset
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="container" data-v-8b623b34><div class="card" data-v-8b623b34><div class="card-title" data-v-8b623b34>Number of Borrowers</div><span class="toggle-label" data-v-8b623b34>How many borrowers are on this loan?</span><div class="borrower-selector" data-v-8b623b34><!--[-->`);
      ssrRenderList(4, (n) => {
        _push(`<label class="${ssrRenderClass({ active: borrowerCount.value === n })}" data-v-8b623b34><input type="radio"${ssrRenderAttr("value", n)}${ssrIncludeBooleanAttr(ssrLooseEqual(borrowerCount.value, n)) ? " checked" : ""} data-v-8b623b34> ${ssrInterpolate(n)}</label>`);
      });
      _push(`<!--]--></div></div><div class="card" data-v-8b623b34><div class="card-title" data-v-8b623b34>Borrower Details</div><!--[-->`);
      ssrRenderList(borrowers, (b, i) => {
        _push(`<div style="${ssrRenderStyle({ "margin-bottom": "20px" })}" data-v-8b623b34><div class="auth-card-title" data-v-8b623b34>Borrower ${ssrInterpolate(i + 1)}</div><div class="field-row" data-v-8b623b34><div class="${ssrRenderClass([{ "has-error": showErrors.value && !b.surname.trim() }, "field"])}" data-v-8b623b34><label data-v-8b623b34>Surname *</label><input${ssrRenderAttr("value", b.surname)} type="text" placeholder="e.g. Smith" data-v-8b623b34>`);
        if (showErrors.value && !b.surname.trim()) {
          _push(`<div class="err-msg" data-v-8b623b34>Required</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="${ssrRenderClass([{ "has-error": showErrors.value && !b.given_names.trim() }, "field"])}" data-v-8b623b34><label data-v-8b623b34>Given Name(s) *</label><input${ssrRenderAttr("value", b.given_names)} type="text" placeholder="e.g. John Michael" data-v-8b623b34>`);
        if (showErrors.value && !b.given_names.trim()) {
          _push(`<div class="err-msg" data-v-8b623b34>Required</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div>`);
      });
      _push(`<!--]--></div><div class="card" data-v-8b623b34><div class="card-title" data-v-8b623b34>Loan Details</div><div class="field-row" data-v-8b623b34><div class="${ssrRenderClass([{ "has-error": showErrors.value && !loanAccountNumber.value.trim() }, "field"])}" data-v-8b623b34><label data-v-8b623b34>Loan Account Number *</label><input${ssrRenderAttr("value", loanAccountNumber.value)} type="text" placeholder="e.g. 1234567890" data-v-8b623b34>`);
      if (showErrors.value && !loanAccountNumber.value.trim()) {
        _push(`<div class="err-msg" data-v-8b623b34>Required</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div><div class="card" data-v-8b623b34><div class="card-title" data-v-8b623b34>Linked Bank Accounts</div>`);
      if (showErrors.value && linkedAccounts.length === 0) {
        _push(`<div class="err-msg" style="${ssrRenderStyle({ "margin-bottom": "12px" })}" data-v-8b623b34> At least one linked account is required. </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(linkedAccounts, (acc, ai) => {
        _push(`<div class="auth-card" style="${ssrRenderStyle({ "margin-bottom": "16px" })}" data-v-8b623b34><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "14px" })}" data-v-8b623b34><div class="auth-card-title" style="${ssrRenderStyle({ "margin-bottom": "0" })}" data-v-8b623b34>Account ${ssrInterpolate(ai + 1)}</div>`);
        if (linkedAccounts.length > 1) {
          _push(`<button type="button" class="btn-remove" data-v-8b623b34> Remove </button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="field-row" data-v-8b623b34><div class="${ssrRenderClass([{ "has-error": showErrors.value && !acc.bank_name.trim() }, "field"])}" data-v-8b623b34><label data-v-8b623b34>Bank Name *</label><input${ssrRenderAttr("value", acc.bank_name)} type="text" placeholder="e.g. Commonwealth Bank" data-v-8b623b34>`);
        if (showErrors.value && !acc.bank_name.trim()) {
          _push(`<div class="err-msg" data-v-8b623b34>Required</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="${ssrRenderClass([{ "has-error": showErrors.value && !acc.account_name.trim() }, "field"])}" data-v-8b623b34><label data-v-8b623b34>Account Name *</label><input${ssrRenderAttr("value", acc.account_name)} type="text" placeholder="e.g. John Smith" data-v-8b623b34>`);
        if (showErrors.value && !acc.account_name.trim()) {
          _push(`<div class="err-msg" data-v-8b623b34>Required</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="field-row" data-v-8b623b34><div class="${ssrRenderClass([{ "has-error": showErrors.value && bsbError(acc.bsb) }, "field"])}" data-v-8b623b34><label data-v-8b623b34>BSB *</label><input${ssrRenderAttr("value", acc.bsb)} type="text" placeholder="000-000" maxlength="7" data-v-8b623b34>`);
        if (showErrors.value && bsbError(acc.bsb)) {
          _push(`<div class="err-msg" data-v-8b623b34>${ssrInterpolate(bsbError(acc.bsb))}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="${ssrRenderClass([{ "has-error": showErrors.value && !acc.account_number.trim() }, "field"])}" data-v-8b623b34><label data-v-8b623b34>Account Number *</label><input${ssrRenderAttr("value", acc.account_number)} type="text" placeholder="e.g. 12345678" data-v-8b623b34>`);
        if (showErrors.value && !acc.account_number.trim()) {
          _push(`<div class="err-msg" data-v-8b623b34>Required</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="${ssrRenderClass([{ "has-error": showErrors.value && !acc.bank_statement_data }, "field"])}" data-v-8b623b34><label data-v-8b623b34>Bank Statement * <span style="${ssrRenderStyle({ "font-weight": "400", "color": "var(--muted)" })}" data-v-8b623b34>(PDF, JPG or PNG)</span></label>`);
        if (acc.bank_statement_filename) {
          _push(`<div class="file-display" data-v-8b623b34><span class="file-name" data-v-8b623b34>${ssrInterpolate(acc.bank_statement_filename)}</span><button type="button" class="btn-file-remove" data-v-8b623b34>Remove</button></div>`);
        } else {
          _push(`<div data-v-8b623b34><label${ssrRenderAttr("for", `stmt-${ai}`)} class="btn-file-upload" data-v-8b623b34>Choose File</label><input${ssrRenderAttr("id", `stmt-${ai}`)} type="file" accept=".pdf,.jpg,.jpeg,.png" style="${ssrRenderStyle({ "display": "none" })}" data-v-8b623b34></div>`);
        }
        if (showErrors.value && !acc.bank_statement_data) {
          _push(`<div class="err-msg" data-v-8b623b34>Bank statement is required</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      });
      _push(`<!--]-->`);
      if (linkedAccounts.length < 4) {
        _push(`<button type="button" class="btn-add" data-v-8b623b34> + Add Another Account </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="card" data-v-8b623b34><div class="card-title" data-v-8b623b34>Customer Authorisation</div><p style="${ssrRenderStyle({ "font-size": "13px", "color": "var(--muted)", "margin-bottom": "18px" })}" data-v-8b623b34> By signing below, each borrower authorises WLTH to link the nominated bank account(s) to their loan. </p><!--[-->`);
      ssrRenderList(borrowers, (b, i) => {
        _push(`<div class="auth-card" style="${ssrRenderStyle({ "margin-bottom": "16px" })}" data-v-8b623b34><div class="auth-card-title" data-v-8b623b34> Borrower ${ssrInterpolate(i + 1)} \u2013 ${ssrInterpolate(fullName(b) || "Name not yet entered")}</div><div class="field-row" data-v-8b623b34><div class="field" data-v-8b623b34><label data-v-8b623b34>Home Contact (optional)</label><input${ssrRenderAttr("value", auths[i].home_contact)} type="tel" placeholder="e.g. 02 9999 9999" data-v-8b623b34></div><div class="field" data-v-8b623b34><label data-v-8b623b34>Work Contact (optional)</label><input${ssrRenderAttr("value", auths[i].work_contact)} type="tel" placeholder="e.g. 02 8888 8888" data-v-8b623b34></div></div><div class="field-row" data-v-8b623b34><div class="${ssrRenderClass([{ "has-error": showErrors.value && !auths[i].signed_date }, "field"])}" data-v-8b623b34><label data-v-8b623b34>Date *</label><input${ssrRenderAttr("value", auths[i].signed_date)} type="date" data-v-8b623b34>`);
        if (showErrors.value && !auths[i].signed_date) {
          _push(`<div class="err-msg" data-v-8b623b34>Date required</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
        _push(ssrRenderComponent(_component_SignatureCanvas, {
          error: showErrors.value && !sigs[i],
          "onUpdate:value": (v) => sigs[i] = v
        }, null, _parent));
        _push(`</div>`);
      });
      _push(`<!--]--></div>`);
      if (submitError.value) {
        _push(`<div class="err-msg" style="${ssrRenderStyle({ "margin-bottom": "12px", "font-size": "13px" })}" data-v-8b623b34>${ssrInterpolate(submitError.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="btn-submit"${ssrIncludeBooleanAttr(submitting.value) ? " disabled" : ""} data-v-8b623b34>${ssrInterpolate(submitting.value ? "Submitting\u2026" : "Submit Linked Account Nomination")}</button></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/linked-account.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const linkedAccount = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-8b623b34"]]);

export { linkedAccount as default };
//# sourceMappingURL=linked-account-Cd65x6Vi.mjs.map
