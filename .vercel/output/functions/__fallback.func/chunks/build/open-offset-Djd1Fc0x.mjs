import { _ as __nuxt_component_0, a as __nuxt_component_1, b as __nuxt_component_2 } from './SignatureCanvas-DQrKARAA.mjs';
import { defineComponent, ref, watch, computed, useSSRContext } from 'vue';
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
  __name: "open-offset",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({ title: "Open Offset Account \u2013 WLTH" });
    const borrowerCount = ref(1);
    const linkedAccountNumber = ref("");
    const showErrors = ref(false);
    const submitting = ref(false);
    const submitted = ref(false);
    const submissionId = ref("");
    function makeBorrower() {
      return { surname: "", given_names: "", customer_number: "" };
    }
    function makeAuth() {
      return { signed_date: "" };
    }
    const borrowers = ref([makeBorrower()]);
    const auths = ref([makeAuth()]);
    const sigs = ref([null]);
    watch(borrowerCount, (n) => {
      while (borrowers.value.length < n) {
        borrowers.value.push(makeBorrower());
        auths.value.push(makeAuth());
        sigs.value.push(null);
      }
      borrowers.value.splice(n);
      auths.value.splice(n);
      sigs.value.splice(n);
    });
    const hasErrors = computed(() => {
      if (!linkedAccountNumber.value.trim()) return true;
      for (let i = 0; i < borrowerCount.value; i++) {
        const b = borrowers.value[i];
        if (!b.surname.trim() || !b.given_names.trim() || !b.customer_number.trim()) return true;
        if (!auths.value[i].signed_date) return true;
        if (!sigs.value[i]) return true;
      }
      return false;
    });
    function reset() {
      borrowerCount.value = 1;
      linkedAccountNumber.value = "";
      borrowers.value = [makeBorrower()];
      auths.value = [makeAuth()];
      sigs.value = [null];
      showErrors.value = false;
      submitted.value = false;
      submissionId.value = "";
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AppHeader = __nuxt_component_0;
      const _component_SuccessOverlay = __nuxt_component_1;
      const _component_SignatureCanvas = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-03ecbf36>`);
      _push(ssrRenderComponent(_component_AppHeader, { title: "Open Offset Account" }, null, _parent));
      if (submitted.value) {
        _push(ssrRenderComponent(_component_SuccessOverlay, {
          "ref-id": submissionId.value,
          onReset: reset
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="container" data-v-03ecbf36><p class="form-desc" data-v-03ecbf36> Complete this form to open an offset account linked to your home loan. </p><div class="card" data-v-03ecbf36><div class="card-title" data-v-03ecbf36>Number of Borrowers</div><span class="toggle-label" data-v-03ecbf36>How many borrowers are on this loan?</span><div class="borrower-selector" data-v-03ecbf36><!--[-->`);
      ssrRenderList(4, (n) => {
        _push(`<label class="${ssrRenderClass({ active: borrowerCount.value === n })}" data-v-03ecbf36><input type="radio"${ssrRenderAttr("value", n)}${ssrIncludeBooleanAttr(ssrLooseEqual(borrowerCount.value, n)) ? " checked" : ""} data-v-03ecbf36> ${ssrInterpolate(n)}</label>`);
      });
      _push(`<!--]--></div></div><!--[-->`);
      ssrRenderList(borrowers.value, (b, i) => {
        _push(`<div class="card" data-v-03ecbf36><div class="card-title" data-v-03ecbf36>Borrower ${ssrInterpolate(i + 1)}</div><div class="field-row" data-v-03ecbf36><div class="${ssrRenderClass([{ "has-error": showErrors.value && !b.surname.trim() }, "field"])}" data-v-03ecbf36><label data-v-03ecbf36>Surname *</label><input${ssrRenderAttr("value", b.surname)} type="text" placeholder="Last name" data-v-03ecbf36>`);
        if (showErrors.value && !b.surname.trim()) {
          _push(`<div class="err-msg" data-v-03ecbf36>Surname is required</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="${ssrRenderClass([{ "has-error": showErrors.value && !b.given_names.trim() }, "field"])}" data-v-03ecbf36><label data-v-03ecbf36>Given Names *</label><input${ssrRenderAttr("value", b.given_names)} type="text" placeholder="First and middle names" data-v-03ecbf36>`);
        if (showErrors.value && !b.given_names.trim()) {
          _push(`<div class="err-msg" data-v-03ecbf36>Given names are required</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="field-row" data-v-03ecbf36><div class="${ssrRenderClass([{ "has-error": showErrors.value && !b.customer_number.trim() }, "field"])}" data-v-03ecbf36><label data-v-03ecbf36>Customer Number *</label><input${ssrRenderAttr("value", b.customer_number)} type="text" placeholder="e.g. 1234567" data-v-03ecbf36>`);
        if (showErrors.value && !b.customer_number.trim()) {
          _push(`<div class="err-msg" data-v-03ecbf36>Customer number is required</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="field" data-v-03ecbf36></div></div></div>`);
      });
      _push(`<!--]--><div class="card" data-v-03ecbf36><div class="card-title" data-v-03ecbf36>Linked Account</div><div class="field-row" data-v-03ecbf36><div class="${ssrRenderClass([{ "has-error": showErrors.value && !linkedAccountNumber.value.trim() }, "field"])}" data-v-03ecbf36><label data-v-03ecbf36>Linked Account Number *</label><input${ssrRenderAttr("value", linkedAccountNumber.value)} type="text" placeholder="Loan account number to link offset to" data-v-03ecbf36>`);
      if (showErrors.value && !linkedAccountNumber.value.trim()) {
        _push(`<div class="err-msg" data-v-03ecbf36>Linked account number is required</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div><div class="card" data-v-03ecbf36><div class="card-title" data-v-03ecbf36>Customer Authorisation</div><!--[-->`);
      ssrRenderList(borrowers.value, (b, i) => {
        _push(`<div class="auth-card" data-v-03ecbf36><div class="auth-card-title" data-v-03ecbf36> Authorisation \u2013 Borrower ${ssrInterpolate(i + 1)} `);
        if (b.given_names || b.surname) {
          _push(`<span data-v-03ecbf36> (${ssrInterpolate(b.given_names)} ${ssrInterpolate(b.surname)})</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="field-row" data-v-03ecbf36><div class="${ssrRenderClass([{ "has-error": showErrors.value && !auths.value[i].signed_date }, "field"])}" data-v-03ecbf36><label data-v-03ecbf36>Date *</label><input${ssrRenderAttr("value", auths.value[i].signed_date)} type="date" data-v-03ecbf36>`);
        if (showErrors.value && !auths.value[i].signed_date) {
          _push(`<div class="err-msg" data-v-03ecbf36>Date is required</div>`);
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
      if (showErrors.value && hasErrors.value) {
        _push(`<div class="err-msg" style="${ssrRenderStyle({ "margin-bottom": "12px", "font-size": "13px" })}" data-v-03ecbf36> Please fix the errors above before submitting. </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="btn-submit"${ssrIncludeBooleanAttr(submitting.value) ? " disabled" : ""} data-v-03ecbf36>${ssrInterpolate(submitting.value ? "Submitting..." : "Submit Form")}</button></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/open-offset.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const openOffset = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-03ecbf36"]]);

export { openOffset as default };
//# sourceMappingURL=open-offset-Djd1Fc0x.mjs.map
