import { _ as __nuxt_component_0, a as __nuxt_component_1, b as __nuxt_component_2 } from './SignatureCanvas-DQrKARAA.mjs';
import { defineComponent, ref, watch, useSSRContext } from 'vue';
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
  __name: "product-switch",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({ title: "Product Switch Request \u2013 WLTH" });
    let _idCounter = 0;
    function newSwitch() {
      return {
        _id: ++_idCounter,
        loan_account_number: "",
        repayment_type: "principal_and_interest",
        interest_only_years: void 0,
        rate_type: "variable",
        fixed_rate_percent: void 0,
        fixed_period_years: void 0
      };
    }
    function newBorrower() {
      return { surname: "", given_names: "" };
    }
    function newAuth() {
      return { home_contact: "", work_contact: "", signed_date: "" };
    }
    const borrowerCount = ref(1);
    const borrowers = ref([newBorrower()]);
    const auths = ref([newAuth()]);
    const sigs = ref([null]);
    const loanSwitches = ref([newSwitch()]);
    const reasonForRequest = ref("");
    const showErrors = ref(false);
    const submitting = ref(false);
    const submitted = ref(false);
    const submissionId = ref("");
    const submitError = ref("");
    function setBorrowerCount(n) {
      borrowerCount.value = n;
      while (borrowers.value.length < n) {
        borrowers.value.push(newBorrower());
        auths.value.push(newAuth());
        sigs.value.push(null);
      }
      borrowers.value.splice(n);
      auths.value.splice(n);
      sigs.value.splice(n);
    }
    watch(borrowerCount, (n) => setBorrowerCount(n));
    function fullName(b) {
      return [b.given_names, b.surname].filter(Boolean).join(" ");
    }
    function isValidIOYears(v) {
      return typeof v === "number" && Number.isInteger(v) && v >= 1;
    }
    function isValidFixedRate(v) {
      return typeof v === "number" && v > 0;
    }
    function isValidFixedPeriod(v) {
      return typeof v === "number" && Number.isInteger(v) && v >= 1;
    }
    function reset() {
      _idCounter = 0;
      borrowerCount.value = 1;
      borrowers.value = [newBorrower()];
      auths.value = [newAuth()];
      sigs.value = [null];
      loanSwitches.value = [newSwitch()];
      reasonForRequest.value = "";
      showErrors.value = false;
      submitted.value = false;
      submissionId.value = "";
      submitError.value = "";
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AppHeader = __nuxt_component_0;
      const _component_SuccessOverlay = __nuxt_component_1;
      const _component_SignatureCanvas = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-8b91a93f>`);
      _push(ssrRenderComponent(_component_AppHeader, { title: "Product Switch Request" }, null, _parent));
      if (submitted.value) {
        _push(ssrRenderComponent(_component_SuccessOverlay, {
          "ref-id": submissionId.value,
          onReset: reset
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="container" data-v-8b91a93f><div class="card" data-v-8b91a93f><div class="card-title" data-v-8b91a93f>Number of Borrowers</div><div class="borrower-selector" data-v-8b91a93f><!--[-->`);
      ssrRenderList(4, (n) => {
        _push(`<label class="${ssrRenderClass({ active: borrowerCount.value === n })}" data-v-8b91a93f><input type="radio"${ssrRenderAttr("value", n)}${ssrIncludeBooleanAttr(ssrLooseEqual(borrowerCount.value, n)) ? " checked" : ""} data-v-8b91a93f> ${ssrInterpolate(n)} ${ssrInterpolate(n === 1 ? "Borrower" : "Borrowers")}</label>`);
      });
      _push(`<!--]--></div></div><div class="card" data-v-8b91a93f><div class="card-title" data-v-8b91a93f>Borrower Details</div><!--[-->`);
      ssrRenderList(borrowers.value, (b, i) => {
        _push(`<div class="borrower-block" data-v-8b91a93f><div class="borrower-block-label" data-v-8b91a93f>Borrower ${ssrInterpolate(i + 1)}</div><div class="field-row" data-v-8b91a93f><div class="${ssrRenderClass([{ "has-error": showErrors.value && !b.surname.trim() }, "field"])}" data-v-8b91a93f><label data-v-8b91a93f>SURNAME *</label><input${ssrRenderAttr("value", b.surname)} type="text" placeholder="Smith" data-v-8b91a93f>`);
        if (showErrors.value && !b.surname.trim()) {
          _push(`<div class="err-msg" data-v-8b91a93f>Required</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="${ssrRenderClass([{ "has-error": showErrors.value && !b.given_names.trim() }, "field"])}" data-v-8b91a93f><label data-v-8b91a93f>GIVEN NAME(S) *</label><input${ssrRenderAttr("value", b.given_names)} type="text" placeholder="John" data-v-8b91a93f>`);
        if (showErrors.value && !b.given_names.trim()) {
          _push(`<div class="err-msg" data-v-8b91a93f>Required</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div>`);
      });
      _push(`<!--]--></div><div class="card" data-v-8b91a93f><div class="card-title-row" data-v-8b91a93f><span class="card-title" style="${ssrRenderStyle({ "margin-bottom": "0", "padding-bottom": "0", "border-bottom": "none" })}" data-v-8b91a93f>Loan Switch Details</span><span class="switch-badge" data-v-8b91a93f>${ssrInterpolate(loanSwitches.value.length)} of 3</span></div><div style="${ssrRenderStyle({ "border-bottom": "1px solid var(--border)", "margin-bottom": "18px", "margin-top": "10px" })}" data-v-8b91a93f></div>`);
      if (showErrors.value && loanSwitches.value.length === 0) {
        _push(`<div class="err-msg" style="${ssrRenderStyle({ "margin-bottom": "12px" })}" data-v-8b91a93f> At least one loan switch is required. </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(loanSwitches.value, (sw, i) => {
        _push(`<div class="loan-switch-block" data-v-8b91a93f><div class="loan-switch-header" data-v-8b91a93f><span class="loan-switch-num" data-v-8b91a93f>Loan Switch ${ssrInterpolate(i + 1)}</span><button type="button" class="btn-remove" data-v-8b91a93f>Remove</button></div><div class="field-row" data-v-8b91a93f><div class="${ssrRenderClass([{ "has-error": showErrors.value && !sw.loan_account_number.trim() }, "field"])}" data-v-8b91a93f><label data-v-8b91a93f>LOAN ACCOUNT NUMBER *</label><input${ssrRenderAttr("value", sw.loan_account_number)} type="text" placeholder="e.g. 100012345" data-v-8b91a93f>`);
        if (showErrors.value && !sw.loan_account_number.trim()) {
          _push(`<div class="err-msg" data-v-8b91a93f>Required</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div data-v-8b91a93f><span class="toggle-label" data-v-8b91a93f>REPAYMENT TYPE *</span><div class="toggle-row" data-v-8b91a93f><label class="toggle-opt" data-v-8b91a93f><input type="radio"${ssrRenderAttr("name", "repayment_" + sw._id)} value="principal_and_interest"${ssrIncludeBooleanAttr(ssrLooseEqual(sw.repayment_type, "principal_and_interest")) ? " checked" : ""} data-v-8b91a93f><span data-v-8b91a93f>Principal &amp; Interest</span></label><label class="toggle-opt" data-v-8b91a93f><input type="radio"${ssrRenderAttr("name", "repayment_" + sw._id)} value="interest_only"${ssrIncludeBooleanAttr(ssrLooseEqual(sw.repayment_type, "interest_only")) ? " checked" : ""} data-v-8b91a93f><span data-v-8b91a93f>Interest Only</span></label></div>`);
        if (sw.repayment_type === "interest_only") {
          _push(`<div class="field-row" data-v-8b91a93f><div style="${ssrRenderStyle({ "max-width": "220px" })}" class="${ssrRenderClass([{ "has-error": showErrors.value && !isValidIOYears(sw.interest_only_years) }, "field"])}" data-v-8b91a93f><label data-v-8b91a93f>IO TERM (YEARS) *</label><input${ssrRenderAttr("value", sw.interest_only_years)} type="number" min="1" step="1" placeholder="e.g. 5" data-v-8b91a93f>`);
          if (showErrors.value && !isValidIOYears(sw.interest_only_years)) {
            _push(`<div class="err-msg" data-v-8b91a93f> Required \u2013 enter a whole number of at least 1 </div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div data-v-8b91a93f><span class="toggle-label" data-v-8b91a93f>RATE TYPE *</span><div class="toggle-row" data-v-8b91a93f><label class="toggle-opt" data-v-8b91a93f><input type="radio"${ssrRenderAttr("name", "rate_" + sw._id)} value="variable"${ssrIncludeBooleanAttr(ssrLooseEqual(sw.rate_type, "variable")) ? " checked" : ""} data-v-8b91a93f><span data-v-8b91a93f>Variable</span></label><label class="toggle-opt" data-v-8b91a93f><input type="radio"${ssrRenderAttr("name", "rate_" + sw._id)} value="fixed"${ssrIncludeBooleanAttr(ssrLooseEqual(sw.rate_type, "fixed")) ? " checked" : ""} data-v-8b91a93f><span data-v-8b91a93f>Fixed</span></label></div>`);
        if (sw.rate_type === "fixed") {
          _push(`<div class="field-row" data-v-8b91a93f><div class="${ssrRenderClass([{ "has-error": showErrors.value && !isValidFixedRate(sw.fixed_rate_percent) }, "field"])}" data-v-8b91a93f><label data-v-8b91a93f>FIXED RATE (%) *</label><input${ssrRenderAttr("value", sw.fixed_rate_percent)} type="number" min="0.01" step="0.01" placeholder="e.g. 5.99" data-v-8b91a93f>`);
          if (showErrors.value && !isValidFixedRate(sw.fixed_rate_percent)) {
            _push(`<div class="err-msg" data-v-8b91a93f> Required \u2013 must be greater than 0 </div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="${ssrRenderClass([{ "has-error": showErrors.value && !isValidFixedPeriod(sw.fixed_period_years) }, "field"])}" data-v-8b91a93f><label data-v-8b91a93f>FIXED PERIOD (YEARS) *</label><input${ssrRenderAttr("value", sw.fixed_period_years)} type="number" min="1" step="1" placeholder="e.g. 3" data-v-8b91a93f>`);
          if (showErrors.value && !isValidFixedPeriod(sw.fixed_period_years)) {
            _push(`<div class="err-msg" data-v-8b91a93f> Required \u2013 enter a whole number of at least 1 </div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      });
      _push(`<!--]-->`);
      if (loanSwitches.value.length < 3) {
        _push(`<button type="button" class="btn-add-switch" data-v-8b91a93f> + Add Loan Switch </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="card" data-v-8b91a93f><div class="card-title" data-v-8b91a93f>Reason for Request <span style="${ssrRenderStyle({ "font-weight": "400", "color": "var(--muted)" })}" data-v-8b91a93f>(optional)</span></div><div class="field" data-v-8b91a93f><label data-v-8b91a93f>REASON</label><textarea rows="4" placeholder="Provide any additional context or reason for this product switch request..." data-v-8b91a93f>${ssrInterpolate(reasonForRequest.value)}</textarea></div></div><div class="card" data-v-8b91a93f><div class="card-title" data-v-8b91a93f>Customer Authorisation</div><!--[-->`);
      ssrRenderList(borrowers.value, (b, i) => {
        _push(`<div class="auth-card" data-v-8b91a93f><div class="auth-card-title" data-v-8b91a93f>Borrower ${ssrInterpolate(i + 1)} \u2013 ${ssrInterpolate(fullName(b) || "(name not entered)")}</div><div class="field-row" data-v-8b91a93f><div class="field" data-v-8b91a93f><label data-v-8b91a93f>HOME CONTACT (OPTIONAL)</label><input${ssrRenderAttr("value", auths.value[i].home_contact)} type="text" placeholder="04XX XXX XXX" data-v-8b91a93f></div><div class="field" data-v-8b91a93f><label data-v-8b91a93f>WORK CONTACT (OPTIONAL)</label><input${ssrRenderAttr("value", auths.value[i].work_contact)} type="text" placeholder="02 XXXX XXXX" data-v-8b91a93f></div></div><div class="field-row" data-v-8b91a93f><div style="${ssrRenderStyle({ "max-width": "220px" })}" class="${ssrRenderClass([{ "has-error": showErrors.value && !auths.value[i].signed_date }, "field"])}" data-v-8b91a93f><label data-v-8b91a93f>DATE *</label><input${ssrRenderAttr("value", auths.value[i].signed_date)} type="date" data-v-8b91a93f>`);
        if (showErrors.value && !auths.value[i].signed_date) {
          _push(`<div class="err-msg" data-v-8b91a93f>Required</div>`);
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
      if (submitError.value) {
        _push(`<div class="err-msg" style="${ssrRenderStyle({ "margin-bottom": "10px", "font-size": "13px" })}" data-v-8b91a93f>${ssrInterpolate(submitError.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button type="button" class="btn-submit"${ssrIncludeBooleanAttr(submitting.value) ? " disabled" : ""} data-v-8b91a93f>${ssrInterpolate(submitting.value ? "Submitting\u2026" : "Submit Product Switch Request")}</button></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/product-switch.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const productSwitch = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-8b91a93f"]]);

export { productSwitch as default };
//# sourceMappingURL=product-switch-v-SfOQ6B.mjs.map
