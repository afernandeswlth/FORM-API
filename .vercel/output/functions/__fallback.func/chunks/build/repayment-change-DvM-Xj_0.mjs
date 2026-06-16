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
  __name: "repayment-change",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({ title: "Repayment Change \u2013 WLTH Forms" });
    const frequencyOptions = [
      { label: "Weekly", value: "weekly" },
      { label: "Fortnightly", value: "fortnightly" },
      { label: "Monthly", value: "monthly" }
    ];
    const borrowerCount = ref(1);
    function makeBorrower() {
      return { surname: "", given_names: "" };
    }
    function makeChange() {
      return { loan_account_number: "", new_amount: null, frequency: "" };
    }
    function makeAuth() {
      return { signed_date: "", home_contact: "", work_contact: "" };
    }
    const borrowers = ref([makeBorrower()]);
    const repaymentChanges = ref([makeChange()]);
    const comments = ref("");
    const auths = ref([makeAuth()]);
    const sigs = ref([null]);
    const showErrors = ref(false);
    const submitting = ref(false);
    const submitted = ref(false);
    const submissionId = ref("");
    const submitError = ref("");
    watch(borrowerCount, (n) => {
      while (borrowers.value.length < n) borrowers.value.push(makeBorrower());
      while (borrowers.value.length > n) borrowers.value.pop();
      while (auths.value.length < n) auths.value.push(makeAuth());
      while (auths.value.length > n) auths.value.pop();
      while (sigs.value.length < n) sigs.value.push(null);
      while (sigs.value.length > n) sigs.value.pop();
    });
    function reset() {
      borrowerCount.value = 1;
      borrowers.value = [makeBorrower()];
      repaymentChanges.value = [makeChange()];
      comments.value = "";
      auths.value = [makeAuth()];
      sigs.value = [null];
      showErrors.value = false;
      submitted.value = false;
      submissionId.value = "";
      submitError.value = "";
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AppHeader = __nuxt_component_0;
      const _component_SuccessOverlay = __nuxt_component_1;
      const _component_SignatureCanvas = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-bd38d240>`);
      _push(ssrRenderComponent(_component_AppHeader, { title: "Repayment Change" }, null, _parent));
      if (submitted.value) {
        _push(ssrRenderComponent(_component_SuccessOverlay, {
          "ref-id": submissionId.value,
          onReset: reset
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="container" data-v-bd38d240><p class="form-desc" data-v-bd38d240> Request a change to your repayment amount or payment frequency on one or more loan accounts. </p><div class="card" data-v-bd38d240><div class="card-title" data-v-bd38d240>Number of Borrowers</div><div class="borrower-selector" data-v-bd38d240><!--[-->`);
      ssrRenderList(4, (n) => {
        _push(`<label class="${ssrRenderClass({ active: borrowerCount.value === n })}" data-v-bd38d240><input type="radio"${ssrRenderAttr("value", n)}${ssrIncludeBooleanAttr(ssrLooseEqual(borrowerCount.value, n)) ? " checked" : ""} data-v-bd38d240> ${ssrInterpolate(n)} ${ssrInterpolate(n === 1 ? "Borrower" : "Borrowers")}</label>`);
      });
      _push(`<!--]--></div></div><div class="card" data-v-bd38d240><div class="card-title" data-v-bd38d240>Borrower Details</div><!--[-->`);
      ssrRenderList(borrowers.value, (b, i) => {
        _push(`<div style="${ssrRenderStyle({ "margin-bottom": "20px" })}" data-v-bd38d240><div style="${ssrRenderStyle({ "font-size": "13px", "font-weight": "700", "color": "var(--muted)", "margin-bottom": "10px" })}" data-v-bd38d240> Borrower ${ssrInterpolate(i + 1)}</div><div class="field-row" data-v-bd38d240><div class="${ssrRenderClass([{ "has-error": showErrors.value && !b.surname.trim() }, "field"])}" data-v-bd38d240><label data-v-bd38d240>Surname *</label><input${ssrRenderAttr("value", b.surname)} type="text" placeholder="Last name" data-v-bd38d240>`);
        if (showErrors.value && !b.surname.trim()) {
          _push(`<div class="err-msg" data-v-bd38d240>Surname is required</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="${ssrRenderClass([{ "has-error": showErrors.value && !b.given_names.trim() }, "field"])}" data-v-bd38d240><label data-v-bd38d240>Given Name(s) *</label><input${ssrRenderAttr("value", b.given_names)} type="text" placeholder="First and middle names" data-v-bd38d240>`);
        if (showErrors.value && !b.given_names.trim()) {
          _push(`<div class="err-msg" data-v-bd38d240>Given name(s) required</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div>`);
      });
      _push(`<!--]--></div><div class="card" data-v-bd38d240><div class="card-title" data-v-bd38d240>Repayment Changes</div><!--[-->`);
      ssrRenderList(repaymentChanges.value, (change, i) => {
        _push(`<div class="change-block" data-v-bd38d240><div class="change-header" data-v-bd38d240><span class="change-num" data-v-bd38d240>Change ${ssrInterpolate(i + 1)}</span>`);
        if (repaymentChanges.value.length > 1) {
          _push(`<button type="button" class="btn-remove" data-v-bd38d240> Remove </button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="field-row" data-v-bd38d240><div class="${ssrRenderClass([{ "has-error": showErrors.value && !change.loan_account_number.trim() }, "field"])}" data-v-bd38d240><label data-v-bd38d240>Loan Account Number *</label><input${ssrRenderAttr("value", change.loan_account_number)} type="text" placeholder="e.g. 1234567890" data-v-bd38d240>`);
        if (showErrors.value && !change.loan_account_number.trim()) {
          _push(`<div class="err-msg" data-v-bd38d240> Loan account number is required </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="${ssrRenderClass([{ "has-error": showErrors.value && !(change.new_amount > 0) }, "field"])}" data-v-bd38d240><label data-v-bd38d240>New Repayment Amount ($) *</label><input${ssrRenderAttr("value", change.new_amount)} type="number" min="0.01" step="0.01" placeholder="0.00" data-v-bd38d240>`);
        if (showErrors.value && !(change.new_amount > 0)) {
          _push(`<div class="err-msg" data-v-bd38d240> Amount must be greater than $0 </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><span class="toggle-label" data-v-bd38d240>Payment Frequency *</span><div class="toggle-row" data-v-bd38d240><!--[-->`);
        ssrRenderList(frequencyOptions, (opt) => {
          _push(`<label class="${ssrRenderClass([{ "has-error": showErrors.value && !change.frequency }, "toggle-opt"])}" data-v-bd38d240><input type="radio"${ssrRenderAttr("name", `freq-${i}`)}${ssrRenderAttr("value", opt.value)}${ssrIncludeBooleanAttr(ssrLooseEqual(change.frequency, opt.value)) ? " checked" : ""} data-v-bd38d240><span data-v-bd38d240>${ssrInterpolate(opt.label)}</span></label>`);
        });
        _push(`<!--]--></div>`);
        if (showErrors.value && !change.frequency) {
          _push(`<div class="err-msg" style="${ssrRenderStyle({ "margin-top": "-10px", "margin-bottom": "10px" })}" data-v-bd38d240> Payment frequency is required </div>`);
        } else {
          _push(`<!---->`);
        }
        if (i < repaymentChanges.value.length - 1) {
          _push(`<hr class="change-divider" data-v-bd38d240>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]-->`);
      if (repaymentChanges.value.length < 4) {
        _push(`<button type="button" class="btn-add" data-v-bd38d240> + Add Another Loan </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="card" data-v-bd38d240><div class="card-title" data-v-bd38d240>Additional Comments</div><div class="field" data-v-bd38d240><label data-v-bd38d240>Comments (optional)</label><textarea rows="4" placeholder="Any additional information or special instructions..." data-v-bd38d240>${ssrInterpolate(comments.value)}</textarea></div></div><div class="card" data-v-bd38d240><div class="card-title" data-v-bd38d240>Customer Authorisation</div><p style="${ssrRenderStyle({ "font-size": "13px", "color": "var(--muted)", "margin-bottom": "18px" })}" data-v-bd38d240> By signing below, each borrower authorises WLTH to make the requested repayment changes. </p><!--[-->`);
      ssrRenderList(borrowers.value, (b, i) => {
        _push(`<div class="auth-card" data-v-bd38d240><div class="auth-card-title" data-v-bd38d240>${ssrInterpolate(b.given_names.trim() || "Borrower " + (i + 1))} ${ssrInterpolate(b.surname.trim())}</div><div class="field-row" data-v-bd38d240><div class="field" data-v-bd38d240><label data-v-bd38d240>Home Contact (optional)</label><input${ssrRenderAttr("value", auths.value[i].home_contact)} type="tel" placeholder="e.g. 02 9999 0000" data-v-bd38d240></div><div class="field" data-v-bd38d240><label data-v-bd38d240>Work Contact (optional)</label><input${ssrRenderAttr("value", auths.value[i].work_contact)} type="tel" placeholder="e.g. 02 8888 0000" data-v-bd38d240></div></div><div class="field-row" data-v-bd38d240><div class="${ssrRenderClass([{ "has-error": showErrors.value && !auths.value[i].signed_date }, "field"])}" data-v-bd38d240><label data-v-bd38d240>Date *</label><input${ssrRenderAttr("value", auths.value[i].signed_date)} type="date" data-v-bd38d240>`);
        if (showErrors.value && !auths.value[i].signed_date) {
          _push(`<div class="err-msg" data-v-bd38d240>Date is required</div>`);
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
        _push(`<div class="err-msg" style="${ssrRenderStyle({ "margin-bottom": "12px", "font-size": "13px" })}" data-v-bd38d240>${ssrInterpolate(submitError.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button type="button" class="btn-submit"${ssrIncludeBooleanAttr(submitting.value) ? " disabled" : ""} data-v-bd38d240>${ssrInterpolate(submitting.value ? "Submitting..." : "Submit Repayment Change Request")}</button></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/repayment-change.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const repaymentChange = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-bd38d240"]]);

export { repaymentChange as default };
//# sourceMappingURL=repayment-change-DvM-Xj_0.mjs.map
