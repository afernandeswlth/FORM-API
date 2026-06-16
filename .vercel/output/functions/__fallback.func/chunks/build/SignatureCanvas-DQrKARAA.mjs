import { _ as __nuxt_component_0$1 } from './nuxt-link-YhNEZhYT.mjs';
import { defineComponent, mergeProps, withCtx, createTextVNode, ref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderClass } from 'vue/server-renderer';
import { _ as _export_sfc } from './server.mjs';

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "AppHeader",
  __ssrInlineRender: true,
  props: {
    title: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<header${ssrRenderAttrs(mergeProps({ class: "app-header" }, _attrs))} data-v-a1ffeb02><div data-v-a1ffeb02><div class="logo" data-v-a1ffeb02>WLTH</div><div class="subtitle" data-v-a1ffeb02>${ssrInterpolate(__props.title)}</div></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "btn-back",
        to: "/"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u2190 All Forms`);
          } else {
            return [
              createTextVNode("\u2190 All Forms")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</header>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AppHeader.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-a1ffeb02"]]);
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "SuccessOverlay",
  __ssrInlineRender: true,
  props: {
    refId: {}
  },
  emits: ["reset"],
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "overlay" }, _attrs))} data-v-47417b3e><div class="box" data-v-47417b3e><div class="icon" data-v-47417b3e>\u2705</div><h2 data-v-47417b3e>Request Submitted</h2><p data-v-47417b3e>Your form has been received and sent to the WLTH team.</p><div class="ref" data-v-47417b3e>Ref: ${ssrInterpolate(__props.refId)}</div><button class="btn-new" data-v-47417b3e>Submit Another</button></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SuccessOverlay.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-47417b3e"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "SignatureCanvas",
  __ssrInlineRender: true,
  props: {
    error: { type: Boolean }
  },
  emits: ["update:value"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const emit = __emit;
    const canvasRef = ref(null);
    ref(false);
    const hasDrawn = ref(false);
    function clear() {
      const canvas = canvasRef.value;
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      hasDrawn.value = false;
      emit("update:value", null);
    }
    __expose({ clear, hasDrawn });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-ff37e6a3><div class="sig-label" data-v-ff37e6a3> Signature * <span class="sig-hint" data-v-ff37e6a3>(draw with mouse or touch)</span></div><div class="sig-wrap" data-v-ff37e6a3><canvas class="${ssrRenderClass([{ error: __props.error && !hasDrawn.value }, "sig-canvas"])}" width="1200" height="240" data-v-ff37e6a3></canvas><button type="button" class="sig-clear" data-v-ff37e6a3>Clear</button></div>`);
      if (__props.error && !hasDrawn.value) {
        _push(`<div class="err-msg" data-v-ff37e6a3>Signature required</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SignatureCanvas.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ff37e6a3"]]);

export { __nuxt_component_0 as _, __nuxt_component_1 as a, __nuxt_component_2 as b };
//# sourceMappingURL=SignatureCanvas-DQrKARAA.mjs.map
