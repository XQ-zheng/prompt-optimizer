window.__ModuleLoader__.load({id:'dsh-prompt-enhancer',factory:(require)=>{var module={exports:{}};var exports=module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.jsx
var client_exports = {};
__export(client_exports, {
  EnhanceButton: () => EnhanceButton,
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(client_exports);
var import_react = __toESM(require("react"), 1);
var import_react_dom = require("react-dom");

// src/core.mjs
function replacementReason(captured, sessionId, live) {
  if (!captured || captured.sessionId !== sessionId) return "\u4F1A\u8BDD\u5DF2\u5207\u6362\uFF0C\u8BF7\u91CD\u65B0\u4F18\u5316\u3002";
  if (live.phase !== "plain") return "\u8F93\u5165\u6846\u6B63\u5728\u63D0\u4EA4\u6216\u5904\u7406\u547D\u4EE4\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002";
  if (live.occurrences?.length || live.draft.includes("\uFFFC")) return "\u5F15\u7528\u82AF\u7247\u6682\u4E0D\u652F\u6301\u66FF\u6362\uFF0C\u8BF7\u4F7F\u7528\u7EAF\u6587\u672C\u8349\u7A3F\u3002";
  if (captured.draftRev !== live.draftRev || captured.draft !== live.draft) return "\u8349\u7A3F\u5DF2\u4FEE\u6539\uFF0C\u4E3A\u4FDD\u62A4\u65B0\u8F93\u5165\uFF0C\u8BF7\u91CD\u65B0\u4F18\u5316\u3002";
  return "";
}
function replaceDraft(captured, sessionId, live, text, actions) {
  if (replacementReason(captured, sessionId, live) || !text.trim() || text.includes("\uFFFC")) return false;
  actions.setDraft(text);
  return true;
}

// src/client.jsx
var import_jsx_runtime = require("react/jsx-runtime");
var CSS = `
[data-prompt-enhancer] { color:inherit; font:inherit; }
button[data-prompt-enhancer], [data-prompt-enhancer] button { border:1px solid color-mix(in srgb, currentColor 20%, transparent); border-radius:8px; padding:6px 10px; background:transparent; color:inherit; cursor:pointer; font:inherit; white-space:nowrap; }
button[data-prompt-enhancer]:disabled, [data-prompt-enhancer] button:disabled { opacity:.45; cursor:default; }
dialog[data-prompt-enhancer] { background:var(--bg-primary, #fff); color:var(--text-primary, #222); border:1px solid #8886; border-radius:14px; width:min(880px, 88vw); max-height:85vh; padding:24px; box-shadow:0 16px 64px #0004; }
dialog[data-prompt-enhancer]::backdrop { background:#0007; }
[data-prompt-enhancer] .pe-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
[data-prompt-enhancer] pre { white-space:pre-wrap; overflow-wrap:anywhere; font:inherit; line-height:1.6; max-height:48vh; overflow:auto; border:1px solid #8885; border-radius:8px; padding:12px; user-select:text; }
[data-prompt-enhancer] footer { display:flex; gap:10px; justify-content:flex-end; margin-top:20px; }
[data-prompt-enhancer] .pe-status { font-size:13px; line-height:1.6; }
[data-prompt-enhancer] .pe-error { color:#c04a36; }
@media(prefers-color-scheme:dark) { dialog[data-prompt-enhancer] { background:var(--bg-primary, #202124); color:var(--text-primary, #eee); } }
@media(max-width:600px) { [data-prompt-enhancer] .pe-grid { grid-template-columns:1fr; } [data-prompt-enhancer] pre { max-height:22vh; } }
`;
function EnhanceButton({ sessionId, useInput, useSession, inputActions }) {
  const input = useInput((s) => s);
  const session = useSession((s) => s);
  const live = (0, import_react.useRef)({ sessionId, input, session });
  live.current = { sessionId, input, session };
  const [view, setView] = (0, import_react.useState)(null);
  const [includeContext, setIncludeContext] = (0, import_react.useState)(true);
  const flight = (0, import_react.useRef)(null);
  const dialog = (0, import_react.useRef)(null);
  const generation = (0, import_react.useRef)(0);
  const available = (s) => !s.removed && s.openState === "open" && !s.subagent;
  const unavailable = !available(session);
  const reason = unavailable ? "\u8BF7\u5148\u6253\u5F00\u666E\u901A\u4F1A\u8BDD\u3002" : input.phase !== "plain" ? "\u6B63\u5728\u5904\u7406\u8F93\u5165\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002" : input.occurrences?.length || input.draft.includes("\uFFFC") ? "\u5F15\u7528\u82AF\u7247\u6682\u4E0D\u652F\u6301\u589E\u5F3A\uFF0C\u8BF7\u4F7F\u7528\u7EAF\u6587\u672C\u8349\u7A3F\u3002" : !input.draft.trim() ? "\u5148\u8F93\u5165\u63D0\u793A\u8BCD\uFF0C\u518D\u70B9\u51FB\u589E\u5F3A\u63D0\u793A\u3002" : input.draft.length > 16384 ? "\u8349\u7A3F\u8D85\u8FC7 16384 \u5B57\u7B26\u3002" : "";
  function close() {
    generation.current++;
    flight.current?.abort();
    flight.current = null;
    setView(null);
  }
  (0, import_react.useEffect)(() => {
    close();
    return () => {
      generation.current++;
      flight.current?.abort();
    };
  }, [sessionId]);
  (0, import_react.useEffect)(() => {
    if (view && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [view]);
  async function optimize(captured) {
    flight.current?.abort();
    const controller = new AbortController();
    flight.current = controller;
    const id = ++generation.current;
    setView({ captured, loading: true });
    const timeout = setTimeout(() => controller.abort(), 95e3);
    try {
      const response = await fetch("/api/prompt-enhancer/optimize", {
        method: "POST",
        headers: { "content-type": "application/json", "x-dsh-prompt-enhancer": "1" },
        body: JSON.stringify({ sessionId: captured.sessionId, draft: captured.draft, includeContext }),
        signal: controller.signal
      });
      const result = await response.json();
      if (id !== generation.current || captured.sessionId !== live.current.sessionId) return;
      if (!response.ok) throw new Error(result.error || "\u4F18\u5316\u8C03\u7528\u5931\u8D25\u3002");
      if (typeof result.optimized !== "string" || !result.optimized.trim()) throw new Error("\u4F18\u5316\u6587\u672C\u4E0D\u53EF\u7528\u3002");
      setView({ captured, result, loading: false });
    } catch (err) {
      if (id === generation.current && captured.sessionId === live.current.sessionId) setView({ captured, loading: false, error: controller.signal.aborted ? "\u4F18\u5316\u5DF2\u53D6\u6D88\u6216\u8D85\u65F6\uFF0C\u8349\u7A3F\u672A\u66FF\u6362\u3002" : err.message });
    } finally {
      clearTimeout(timeout);
      if (flight.current === controller) flight.current = null;
    }
  }
  const stale = view ? replacementReason(view.captured, sessionId, input) || (unavailable ? "\u5F53\u524D\u4F1A\u8BDD\u4E0D\u80FD\u7F16\u8F91\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002" : "") : "";
  function confirm() {
    const current = live.current;
    if (!view?.result || !available(current.session) || !replaceDraft(view.captured, current.sessionId, current.input, view.result.optimized, inputActions)) return;
    close();
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: CSS }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", "data-prompt-enhancer": "button", title: reason || "\u4F18\u5316\u5F53\u524D\u8349\u7A3F\uFF0C\u9884\u89C8\u786E\u8BA4\u540E\u66FF\u6362\uFF1B\u4E0D\u4F1A\u53D1\u9001\u3002", disabled: !!reason || !!view, onClick: () => optimize({ sessionId, draft: input.draft, draftRev: input.draftRev }), children: "\u589E\u5F3A\u63D0\u793A" }),
    view && (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dialog", { "data-prompt-enhancer": "preview", ref: dialog, "aria-labelledby": "pe-title", onCancel: (e) => {
      e.preventDefault();
      close();
    }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { id: "pe-title", children: "\u589E\u5F3A\u63D0\u793A" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "pe-status", children: "\u4EC5\u4F18\u5316\u6587\u5B57\uFF0C\u786E\u8BA4\u540E\u66FF\u6362\u8349\u7A3F\u3002\u4FDD\u7559\u539F\u8BED\u8A00\u3001\u539F\u610F\u4E0E\u7EA6\u675F\uFF0C\u4E0D\u6267\u884C\u4EFB\u52A1\uFF0C\u4E5F\u4E0D\u4F1A\u81EA\u52A8\u53D1\u9001\u3002" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "pe-status", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: includeContext, disabled: view.loading, onChange: (e) => setIncludeContext(e.target.checked) }),
        " \u7ED3\u5408\u672C\u4F1A\u8BDD\u7528\u6237\u6D88\u606F\uFF08\u53EA\u53D6\u7528\u6237\u6587\u5B57\uFF0C\u4E0D\u8BFB\u53D6\u9644\u4EF6\u5185\u5BB9\uFF09"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pe-grid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "\u539F\u59CB\u63D0\u793A\u8BCD" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { children: view.captured.draft })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "\u4F18\u5316\u540E\u7684\u63D0\u793A\u8BCD" }),
          view.loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { role: "status", children: "\u6B63\u5728\u4F18\u5316\u2026" }) : view.result ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { children: view.result.optimized }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { role: "alert", className: "pe-error", children: view.error })
        ] })
      ] }),
      view.result && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "pe-status", children: [
        "\u6A21\u578B\uFF1A",
        view.result.provider,
        " / ",
        view.result.model,
        " \xB7 \u53C2\u8003\u7528\u6237\u6D88\u606F\uFF1A",
        view.result.contextMessages,
        " \u6761\u3002\u8BF7\u6838\u5BF9\u4F18\u5316\u7A3F\u4E2D\u7684\u7EA6\u675F\u3002"
      ] }),
      stale && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { role: "alert", className: "pe-error", children: stale }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: close, children: view.loading ? "\u53D6\u6D88\u4F18\u5316" : "\u53D6\u6D88" }),
        !view.loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: !!reason, onClick: () => optimize({ sessionId, draft: input.draft, draftRev: input.draftRev }), children: "\u91CD\u65B0\u4F18\u5316" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: view.loading || !view.result || !!stale, onClick: confirm, children: "\u66FF\u6362\u8349\u7A3F" })
      ] })
    ] }), document.body)
  ] });
}
var name = "dsh-prompt-enhancer";
var inject = ["slots"];
function apply(ctx) {
  ctx.slots.inject("conversation.input.right", () => ctx.slots.register({ name: "conversation.input.right", id: "dsh-prompt-enhancer", order: 50 }, EnhanceButton), "dsh-prompt-enhancer: composer button");
}
return module.exports;}});
