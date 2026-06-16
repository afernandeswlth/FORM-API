import { _ as __nuxt_component_0 } from './nuxt-link-YhNEZhYT.mjs';
import { defineComponent, withCtx, createVNode, toDisplayString, createTextVNode, openBlock, createBlock, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as useHead } from './v3-CkUdgLcY.mjs';
import { _ as _export_sfc } from './server.mjs';
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
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({ title: "WLTH Forms Portal" });
    const forms = [
      { path: "/direct-debit", icon: "\u{1F4B3}", title: "Direct Debit Request", desc: "Arrange for your loan repayments to be automatically debited from your nominated account." },
      { path: "/linked-account", icon: "\u{1F3E6}", title: "Linked Account Nomination", desc: "Set up a new bank account to be linked to your loan for direct debit or offset purposes." },
      { path: "/repayment-change", icon: "\u{1F504}", title: "Repayment Change", desc: "Request a change to your repayment amount or repayment frequency." },
      { path: "/open-offset", icon: "\u2696\uFE0F", title: "Open Offset", desc: "Open an offset account to be linked to your home loan." },
      { path: "/product-switch", icon: "\u{1F500}", title: "Product Switch", desc: "Switch your existing loan to a different repayment type or interest rate type." },
      { path: "/redraw", icon: "\u{1F4B8}", title: "Redraw Request", desc: "Access available redraw funds from your WLTH loan account." }
    ];
    const comingSoon = [
      { icon: "\u{1F4C9}", title: "Permanent Principal Reduction", desc: "Request a permanent reduction to your outstanding loan principal." }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-938a40d0><header class="site-header" data-v-938a40d0><span class="logo" data-v-938a40d0>WLTH</span><span class="header-sub" data-v-938a40d0>FORMS PORTAL</span></header><main data-v-938a40d0><h1 class="page-title" data-v-938a40d0>Submit a Form</h1><p class="page-sub" data-v-938a40d0>Select the form you would like to complete and submit digitally.</p><div class="form-grid" data-v-938a40d0><!--[-->`);
      ssrRenderList(forms, (form) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: form.path,
          to: form.path,
          class: "form-card"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="card-icon" data-v-938a40d0${_scopeId}>${ssrInterpolate(form.icon)}</div><div class="card-title" data-v-938a40d0${_scopeId}>${ssrInterpolate(form.title)}</div><div class="card-desc" data-v-938a40d0${_scopeId}>${ssrInterpolate(form.desc)}</div><div class="card-action" data-v-938a40d0${_scopeId}> Start form <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24" data-v-938a40d0${_scopeId}><line x1="5" y1="12" x2="19" y2="12" data-v-938a40d0${_scopeId}></line><polyline points="12 5 19 12 12 19" data-v-938a40d0${_scopeId}></polyline></svg></div>`);
            } else {
              return [
                createVNode("div", { class: "card-icon" }, toDisplayString(form.icon), 1),
                createVNode("div", { class: "card-title" }, toDisplayString(form.title), 1),
                createVNode("div", { class: "card-desc" }, toDisplayString(form.desc), 1),
                createVNode("div", { class: "card-action" }, [
                  createTextVNode(" Start form "),
                  (openBlock(), createBlock("svg", {
                    width: "14",
                    height: "14",
                    fill: "none",
                    stroke: "currentColor",
                    "stroke-width": "2.2",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("line", {
                      x1: "5",
                      y1: "12",
                      x2: "19",
                      y2: "12"
                    }),
                    createVNode("polyline", { points: "12 5 19 12 12 19" })
                  ]))
                ])
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--><!--[-->`);
      ssrRenderList(comingSoon, (soon) => {
        _push(`<div class="form-card disabled" data-v-938a40d0><span class="soon-badge" data-v-938a40d0>Coming Soon</span><div class="card-icon" data-v-938a40d0>${ssrInterpolate(soon.icon)}</div><div class="card-title" data-v-938a40d0>${ssrInterpolate(soon.title)}</div><div class="card-desc" data-v-938a40d0>${ssrInterpolate(soon.desc)}</div></div>`);
      });
      _push(`<!--]--></div></main><footer class="site-footer" data-v-938a40d0> WLTH Lend Pty Ltd (CRN 525 873) as authorised by WLTH Pty Ltd (ACN 639 591 245 and AFSL and ACL 525 752) </footer></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-938a40d0"]]);

export { index as default };
//# sourceMappingURL=index-CJi9hH7x.mjs.map
