import { _ as __nuxt_component_0, a as __nuxt_component_1, b as __nuxt_component_2 } from './SignatureCanvas-DQrKARAA.mjs';
import { defineComponent, ref, watch, computed, unref, useSSRContext } from 'vue';
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
  __name: "redraw",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({ title: "Redraw Request \u2013 WLTH" });
    const borrowerCount = ref(1);
    const borrowers = ref([{ surname: "", given_names: "" }]);
    const auths = ref([{ signed_date: "" }]);
    const sigs = ref([null]);
    function setBorrowerCount(n) {
      borrowerCount.value = n;
      while (borrowers.value.length < n) {
        borrowers.value.push({ surname: "", given_names: "" });
        auths.value.push({ signed_date: "" });
        sigs.value.push(null);
      }
      if (borrowers.value.length > n) {
        borrowers.value = borrowers.value.slice(0, n);
        auths.value = auths.value.slice(0, n);
        sigs.value = sigs.value.slice(0, n);
      }
    }
    watch(borrowerCount, (n) => setBorrowerCount(n));
    const loanAccountNumber = ref("");
    const toAccountName = ref("");
    const bsb = ref("");
    const accountNumber = ref("");
    const redrawAmount = ref(null);
    const bsbValid = computed(() => /^\d{3}-\d{3}$/.test(bsb.value));
    const accountNumberValid = computed(() => /^\d+$/.test(accountNumber.value) && accountNumber.value.trim() !== "");
    const redrawAmountValid = computed(() => redrawAmount.value !== null && redrawAmount.value > 0);
    const redrawReason = ref("");
    const showErrors = ref(false);
    const submitting = ref(false);
    const submitted = ref(false);
    const submissionId = ref("");
    const submitError = ref("");
    function reset() {
      showErrors.value = false;
      submitted.value = false;
      submissionId.value = "";
      submitError.value = "";
      borrowerCount.value = 1;
      borrowers.value = [{ surname: "", given_names: "" }];
      auths.value = [{ signed_date: "" }];
      sigs.value = [null];
      loanAccountNumber.value = "";
      toAccountName.value = "";
      bsb.value = "";
      accountNumber.value = "";
      redrawAmount.value = null;
      redrawReason.value = "";
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AppHeader = __nuxt_component_0;
      const _component_SuccessOverlay = __nuxt_component_1;
      const _component_SignatureCanvas = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-ee1ed9dc>`);
      _push(ssrRenderComponent(_component_AppHeader, { title: "Redraw Request" }, null, _parent));
      if (submitted.value) {
        _push(ssrRenderComponent(_component_SuccessOverlay, {
          "ref-id": submissionId.value,
          onReset: reset
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="container" data-v-ee1ed9dc><p class="form-desc" data-v-ee1ed9dc> Use this form to request access to available redraw funds from your WLTH loan account. </p><div class="card" data-v-ee1ed9dc><div class="card-title" data-v-ee1ed9dc>Number of Borrowers</div><div class="borrower-selector" data-v-ee1ed9dc><!--[-->`);
      ssrRenderList(4, (n) => {
        _push(`<label class="${ssrRenderClass({ active: borrowerCount.value === n })}" data-v-ee1ed9dc><input type="radio"${ssrRenderAttr("value", n)}${ssrIncludeBooleanAttr(ssrLooseEqual(borrowerCount.value, n)) ? " checked" : ""} data-v-ee1ed9dc> ${ssrInterpolate(n)}</label>`);
      });
      _push(`<!--]--></div><!--[-->`);
      ssrRenderList(borrowers.value, (b, i) => {
        _push(`<div data-v-ee1ed9dc><div class="auth-card-title" style="${ssrRenderStyle({ "font-size": "13px", "font-weight": "700", "color": "var(--dark)", "margin-bottom": "10px", "margin-top": "8px" })}" data-v-ee1ed9dc> Borrower ${ssrInterpolate(i + 1)}</div><div class="field-row" data-v-ee1ed9dc><div class="${ssrRenderClass([{ "has-error": showErrors.value && !b.surname.trim() }, "field"])}" data-v-ee1ed9dc><label data-v-ee1ed9dc>Surname *</label><input${ssrRenderAttr("value", b.surname)} type="text" placeholder="Smith" data-v-ee1ed9dc>`);
        if (showErrors.value && !b.surname.trim()) {
          _push(`<div class="err-msg" data-v-ee1ed9dc>Required</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="${ssrRenderClass([{ "has-error": showErrors.value && !b.given_names.trim() }, "field"])}" data-v-ee1ed9dc><label data-v-ee1ed9dc>Given Name(s) *</label><input${ssrRenderAttr("value", b.given_names)} type="text" placeholder="John" data-v-ee1ed9dc>`);
        if (showErrors.value && !b.given_names.trim()) {
          _push(`<div class="err-msg" data-v-ee1ed9dc>Required</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div>`);
      });
      _push(`<!--]--></div><div class="card" data-v-ee1ed9dc><div class="card-title" data-v-ee1ed9dc>Loan Details</div><div class="field-row" data-v-ee1ed9dc><div class="${ssrRenderClass([{ "has-error": showErrors.value && !loanAccountNumber.value.trim() }, "field"])}" data-v-ee1ed9dc><label data-v-ee1ed9dc>Loan Account Number *</label><input${ssrRenderAttr("value", loanAccountNumber.value)} type="text" placeholder="e.g. 1234567" data-v-ee1ed9dc>`);
      if (showErrors.value && !loanAccountNumber.value.trim()) {
        _push(`<div class="err-msg" data-v-ee1ed9dc>Required</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div><div class="card" data-v-ee1ed9dc><div class="card-title" data-v-ee1ed9dc>Redraw Destination</div><div class="field-row" data-v-ee1ed9dc><div class="${ssrRenderClass([{ "has-error": showErrors.value && !toAccountName.value.trim() }, "field"])}" data-v-ee1ed9dc><label data-v-ee1ed9dc>To Account Name *</label><input${ssrRenderAttr("value", toAccountName.value)} type="text" placeholder="e.g. John Smith" data-v-ee1ed9dc>`);
      if (showErrors.value && !toAccountName.value.trim()) {
        _push(`<div class="err-msg" data-v-ee1ed9dc>Required</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="field-row" data-v-ee1ed9dc><div class="${ssrRenderClass([{ "has-error": showErrors.value && !unref(bsbValid) }, "field"])}" data-v-ee1ed9dc><label data-v-ee1ed9dc>BSB *</label><input${ssrRenderAttr("value", bsb.value)} type="text" placeholder="000-000" maxlength="7" data-v-ee1ed9dc>`);
      if (showErrors.value && !unref(bsbValid)) {
        _push(`<div class="err-msg" data-v-ee1ed9dc>${ssrInterpolate(bsb.value.trim() ? "BSB must be in format 000-000" : "Required")}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="${ssrRenderClass([{ "has-error": showErrors.value && !unref(accountNumberValid) }, "field"])}" data-v-ee1ed9dc><label data-v-ee1ed9dc>Account Number *</label><input${ssrRenderAttr("value", accountNumber.value)} type="text" placeholder="Digits only" data-v-ee1ed9dc>`);
      if (showErrors.value && !unref(accountNumberValid)) {
        _push(`<div class="err-msg" data-v-ee1ed9dc>${ssrInterpolate(accountNumber.value.trim() ? "Digits only" : "Required")}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="field-row" data-v-ee1ed9dc><div class="${ssrRenderClass([{ "has-error": showErrors.value && !unref(redrawAmountValid) }, "field amount-field"])}" data-v-ee1ed9dc><label data-v-ee1ed9dc>Redraw Amount *</label><div class="amount-wrap" data-v-ee1ed9dc><span class="dollar-prefix" data-v-ee1ed9dc>$</span><input${ssrRenderAttr("value", redrawAmount.value)} type="number" min="0.01" step="0.01" placeholder="0.00" class="amount-input" data-v-ee1ed9dc></div>`);
      if (showErrors.value && !unref(redrawAmountValid)) {
        _push(`<div class="err-msg" data-v-ee1ed9dc>${ssrInterpolate(redrawAmount.value !== null && redrawAmount.value <= 0 ? "Amount must be greater than $0" : "Required")}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (redrawAmount.value !== null && redrawAmount.value >= 1e5) {
        _push(`<div class="large-amount-banner" data-v-ee1ed9dc><span class="banner-icon" data-v-ee1ed9dc>\u26A0</span> Amounts of $100,000 or more require WLTH approval </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="card" data-v-ee1ed9dc><div class="card-title" data-v-ee1ed9dc>Redraw Reason</div><div class="${ssrRenderClass([{ "has-error": showErrors.value && !redrawReason.value.trim() }, "field"])}" data-v-ee1ed9dc><label data-v-ee1ed9dc>What will the funds be used for? *</label><textarea rows="4" placeholder="Please describe what the redrawn funds will be used for..." data-v-ee1ed9dc>${ssrInterpolate(redrawReason.value)}</textarea>`);
      if (showErrors.value && !redrawReason.value.trim()) {
        _push(`<div class="err-msg" data-v-ee1ed9dc>Required</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="card" data-v-ee1ed9dc><div class="card-title" data-v-ee1ed9dc>Customer Authorisation</div><!--[-->`);
      ssrRenderList(borrowers.value, (b, i) => {
        _push(`<div class="auth-card" data-v-ee1ed9dc><div class="auth-card-title" data-v-ee1ed9dc> Borrower ${ssrInterpolate(i + 1)} \u2013 ${ssrInterpolate(b.given_names || "\u2014")} ${ssrInterpolate(b.surname || "\u2014")}</div><div class="field-row" data-v-ee1ed9dc><div class="${ssrRenderClass([{ "has-error": showErrors.value && !auths.value[i].signed_date }, "field"])}" data-v-ee1ed9dc><label data-v-ee1ed9dc>Date *</label><input${ssrRenderAttr("value", auths.value[i].signed_date)} type="date" data-v-ee1ed9dc>`);
        if (showErrors.value && !auths.value[i].signed_date) {
          _push(`<div class="err-msg" data-v-ee1ed9dc>Required</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
        _push(ssrRenderComponent(_component_SignatureCanvas, {
          error: showErrors.value && !sigs.value[i],
          "onUpdate:value": (v) => sigs.value[i] = v
        }, null, _parent));
        if (showErrors.value && !sigs.value[i]) {
          _push(`<div class="err-msg" style="${ssrRenderStyle({ "margin-top": "4px" })}" data-v-ee1ed9dc> Signature required </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--></div><div class="card" data-v-ee1ed9dc>`);
      if (submitError.value) {
        _push(`<div class="err-msg" style="${ssrRenderStyle({ "margin-bottom": "12px", "font-size": "13px" })}" data-v-ee1ed9dc>${ssrInterpolate(submitError.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="btn-submit"${ssrIncludeBooleanAttr(submitting.value) ? " disabled" : ""} data-v-ee1ed9dc>${ssrInterpolate(submitting.value ? "Submitting\u2026" : "Submit Redraw Request")}</button></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/redraw.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const redraw = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ee1ed9dc"]]);

export { redraw as default };
//# sourceMappingURL=redraw-CGfg0Mtz.mjs.map
