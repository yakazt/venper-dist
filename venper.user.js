// ==UserScript==
// @name         Venper
// @namespace    https://github.com/yakazt/venper
// @version      2.0.1
// @description  Open-source Equicord-style client mod for Yapper: plugins, themes, QoL.
// @author       yakazt
// @match        *://yapper.website/*
// @match        *://*.yapper.website/*
// @run-at       document-start
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/yakazt/venper-dist/main/venper.user.js
// @updateURL    https://raw.githubusercontent.com/yakazt/venper-dist/main/venper.meta.js
// @supportURL   https://github.com/yakazt/venper/issues
// ==/UserScript==
// VENPER_VERSION = "2.0.1"

(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __export = (target, all2) => {
    for (var name in all2)
      __defProp(target, name, { get: all2[name], enumerable: true });
  };

  // src/core/log.js
  function log(...args) {
    console.log(PREFIX, STYLE, ...args);
  }
  function warn(...args) {
    console.warn(PREFIX, STYLE, ...args);
  }
  function error(...args) {
    console.error(PREFIX, STYLE, ...args);
  }
  var STYLE, PREFIX;
  var init_log = __esm({
    "src/core/log.js"() {
      STYLE = "color:#8b7af0;font-weight:700";
      PREFIX = "%c[Venper]";
      log.for = (name) => ({
        log: (...a) => console.log(`%c[Venper:${name}]`, STYLE, ...a),
        warn: (...a) => console.warn(`%c[Venper:${name}]`, STYLE, ...a),
        error: (...a) => console.error(`%c[Venper:${name}]`, STYLE, ...a)
      });
    }
  });

  // src/core/internals.js
  var internals_exports = {};
  __export(internals_exports, {
    cachedModules: () => cachedModules,
    findByProps: () => findByProps,
    findModule: () => findModule,
    findModuleIdByCode: () => findModuleIdByCode,
    findStoreModule: () => findStoreModule,
    hasRuntime: () => hasRuntime,
    log: () => log,
    moduleSources: () => moduleSources,
    requireModule: () => requireModule
  });
  function grabRuntime() {
    if (runtime) return runtime;
    const TP = globalThis.TURBOPACK;
    if (!TP || typeof TP.push !== "function") return null;
    try {
      const id = "venper:probe:" + Math.random().toString(36).slice(2);
      TP.push([
        "venper-probe.js",
        id,
        function(ctx) {
          runtime = Object.getPrototypeOf(ctx);
        }
      ]);
      TP.push(["venper-probe-run.js", { otherChunks: [], runtimeModuleIds: [id] }]);
    } catch (e) {
      warn("could not attach to Turbopack runtime", e);
    }
    return runtime;
  }
  function hasRuntime() {
    return !!grabRuntime();
  }
  function cachedModules() {
    const rt = grabRuntime();
    if (!rt || !rt.c) return [];
    return [...rt.c.entries()].map(([id, m]) => [id, m && m.exports]).filter(([, e]) => e);
  }
  function moduleSources() {
    const rt = grabRuntime();
    if (!rt || !rt.M) return [];
    const out = [];
    for (const [id, f] of rt.M.entries()) {
      try {
        out.push([id, f.toString()]);
      } catch {
      }
    }
    return out;
  }
  function requireModule(id) {
    const rt = grabRuntime();
    if (!rt || typeof rt.r !== "function") return void 0;
    try {
      return rt.r(id);
    } catch (e) {
      warn("requireModule failed", id, e);
      return void 0;
    }
  }
  function findModule(filter2) {
    for (const [id, exports] of cachedModules()) {
      try {
        if (filter2(exports, id)) return exports;
      } catch {
      }
    }
    return void 0;
  }
  function findByProps(...names) {
    return findModule((exp) => exp && typeof exp === "object" && names.every((n) => n in exp));
  }
  function findModuleIdByCode(needle) {
    for (const [id, src] of moduleSources()) {
      const hit = needle instanceof RegExp ? needle.test(src) : src.includes(needle);
      if (hit) return id;
    }
    return void 0;
  }
  function findStoreModule() {
    return findModule((exp) => {
      if (!exp || typeof exp !== "object") return false;
      for (const key of Object.keys(exp)) {
        const v = safeGet(exp, key);
        if (typeof v === "function" && typeof v.getState === "function" && typeof v.subscribe === "function") {
          const state2 = tryState(v);
          if (state2 && "userId" in state2 && "channels" in state2 && "messages" in state2) {
            return true;
          }
        }
      }
      return false;
    });
  }
  function safeGet(obj, key) {
    try {
      return obj[key];
    } catch {
      return void 0;
    }
  }
  function tryState(hook2) {
    try {
      return hook2.getState();
    } catch {
      return null;
    }
  }
  var runtime;
  var init_internals = __esm({
    "src/core/internals.js"() {
      init_log();
      runtime = null;
    }
  });

  // src/core/store.js
  var store_exports = {};
  __export(store_exports, {
    activeChannel: () => activeChannel,
    activeChannelId: () => activeChannelId,
    activeServerId: () => activeServerId,
    channel: () => channel,
    displayName: () => displayName,
    findMessage: () => findMessage,
    isAdmin: () => isAdmin,
    isDev: () => isDev,
    isMod: () => isMod,
    me: () => me,
    messagesIn: () => messagesIn,
    module: () => module,
    myId: () => myId,
    nameColor: () => nameColor,
    profile: () => profile,
    ready: () => ready,
    server: () => server,
    state: () => state,
    subscribe: () => subscribe
  });
  function module() {
    if (mod) return mod;
    mod = findStoreModule() || null;
    if (mod) {
      for (const key of Object.keys(mod)) {
        const v = mod[key];
        if (typeof v === "function" && typeof v.getState === "function") {
          hook = v;
          break;
        }
      }
    }
    return mod;
  }
  function ready() {
    return !!module() && !!hook;
  }
  function state() {
    if (!hook) module();
    return hook ? hook.getState() : {};
  }
  function subscribe(fn) {
    if (!hook) module();
    if (!hook) return () => {
    };
    try {
      return hook.subscribe(fn);
    } catch (e) {
      warn("store.subscribe failed", e);
      return () => {
      };
    }
  }
  function myId() {
    return state().userId || null;
  }
  function me() {
    const s = state();
    return s.userId ? s.profiles?.[s.userId] : void 0;
  }
  function activeChannelId() {
    return state().activeChannelId || null;
  }
  function activeServerId() {
    return state().activeServerId || null;
  }
  function channel(id) {
    return id ? state().channels?.[id] : void 0;
  }
  function activeChannel() {
    return channel(activeChannelId());
  }
  function server(id) {
    return id ? state().servers?.[id] : void 0;
  }
  function profile(id) {
    return id ? state().profiles?.[id] : void 0;
  }
  function messagesIn(channelId) {
    return channelId && state().messages?.[channelId] || [];
  }
  function findMessage(id) {
    const m = module();
    if (m && typeof m.findMessage === "function") {
      try {
        return m.findMessage(id);
      } catch {
      }
    }
    const s = state();
    for (const list of Object.values(s.messages || {})) {
      const hit = list.find((x) => x.id === id);
      if (hit) return hit;
    }
    return s.extraMessages?.[id] || void 0;
  }
  function displayName(userId, serverId = activeServerId()) {
    const m = module();
    if (m && typeof m.displayName === "function") {
      try {
        return m.displayName(state(), serverId, userId);
      } catch {
      }
    }
    const p = profile(userId);
    return p?.display_name || p?.username || "Someone";
  }
  function nameColor(userId, serverId = activeServerId()) {
    const m = module();
    if (m && typeof m.nameColor === "function") {
      try {
        return m.nameColor(state(), serverId, userId);
      } catch {
      }
    }
    return void 0;
  }
  function isDev() {
    return !!state().isDev;
  }
  function isMod() {
    return !!state().isMod;
  }
  function isAdmin() {
    return !!state().isAdmin;
  }
  var mod, hook;
  var init_store = __esm({
    "src/core/store.js"() {
      init_internals();
      init_log();
      mod = null;
      hook = null;
    }
  });

  // src/core/actions.js
  var actions_exports = {};
  __export(actions_exports, {
    deleteMessage: () => deleteMessage,
    editMessage: () => editMessage,
    markRead: () => markRead,
    module: () => module2,
    openChannel: () => openChannel,
    openDmWith: () => openDmWith,
    raw: () => raw,
    ready: () => ready2,
    sendMessage: () => sendMessage,
    toggleReaction: () => toggleReaction
  });
  function module2() {
    if (mod2) return mod2;
    mod2 = findModule(
      (exp) => exp && typeof exp === "object" && typeof exp.sendMessage === "function" && typeof exp.deleteMessage === "function" && typeof exp.editMessage === "function" && typeof exp.toggleReaction === "function"
    );
    return mod2;
  }
  function ready2() {
    return !!module2();
  }
  function call(name, args, label) {
    const m = module2();
    if (!m || typeof m[name] !== "function") {
      warn(`action ${name} unavailable`);
      return Promise.reject(new Error(`action ${name} unavailable`));
    }
    try {
      return Promise.resolve(m[name](...args));
    } catch (e) {
      warn(`${label || name} failed`, e);
      return Promise.reject(e);
    }
  }
  function sendMessage(channelId, content, file = null, replyToId = null) {
    return call("sendMessage", [channelId, content, file, replyToId], "sendMessage");
  }
  function editMessage(messageId, content) {
    return call("editMessage", [messageId, content], "editMessage");
  }
  function deleteMessage(messageId) {
    return call("deleteMessage", [messageId], "deleteMessage");
  }
  function toggleReaction(messageId, emoji) {
    return call("toggleReaction", [messageId, emoji], "toggleReaction");
  }
  function openChannel(channelId) {
    return call("openChannel", [channelId], "openChannel");
  }
  function openDmWith(userId) {
    return call("openDmWith", [userId], "openDmWith");
  }
  function markRead(channelId) {
    return call("markRead", [channelId], "markRead");
  }
  function raw(name) {
    const m = module2();
    return m && typeof m[name] === "function" ? m[name].bind(m) : null;
  }
  var mod2;
  var init_actions = __esm({
    "src/core/actions.js"() {
      init_internals();
      init_log();
      mod2 = null;
    }
  });

  // src/core/realtime.js
  var realtime_exports = {};
  __export(realtime_exports, {
    install: () => install,
    onEvent: () => onEvent,
    onFrame: () => onFrame,
    onOutgoing: () => onOutgoing,
    uninstall: () => uninstall
  });
  function isRtSocket(ws) {
    try {
      return typeof ws.url === "string" && ws.url.includes(RT_HOST);
    } catch {
      return false;
    }
  }
  function parse(data) {
    if (typeof data !== "string") return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  function tapIncoming(ws) {
    if (ws.__venperTapped) return;
    ws.__venperTapped = true;
    ws.addEventListener("message", (ev) => {
      if (!frameListeners.size) return;
      const frame = parse(ev.data);
      if (!frame) return;
      for (const fn of frameListeners) {
        try {
          fn(frame);
        } catch (e) {
        }
      }
    });
  }
  function install() {
    if (installed) return;
    installed = true;
    origSend = WebSocket.prototype.send;
    const original = origSend;
    WebSocket.prototype.send = function(data) {
      if (isRtSocket(this)) {
        tapIncoming(this);
        if (outgoingInterceptors.size && typeof data === "string") {
          const frame = parse(data);
          if (frame) {
            for (const fn of outgoingInterceptors) {
              try {
                const verdict = fn(frame);
                if (verdict === false) return;
              } catch {
              }
            }
            data = JSON.stringify(frame);
          }
        }
      }
      return original.apply(this, arguments.length ? [data, ...Array.prototype.slice.call(arguments, 1)] : [data]);
    };
    log("realtime tap installed");
  }
  function uninstall() {
    if (!installed) return;
    if (origSend) WebSocket.prototype.send = origSend;
    installed = false;
    frameListeners.clear();
    outgoingInterceptors.clear();
  }
  function onFrame(fn) {
    frameListeners.add(fn);
    return () => frameListeners.delete(fn);
  }
  function onOutgoing(fn) {
    outgoingInterceptors.add(fn);
    return () => outgoingInterceptors.delete(fn);
  }
  function onEvent(type, fn) {
    return onFrame((frame) => {
      if (frame && frame.type === "event" && frame.event === type) {
        fn(frame.payload, frame);
      }
    });
  }
  var RT_HOST, frameListeners, outgoingInterceptors, installed, origSend;
  var init_realtime = __esm({
    "src/core/realtime.js"() {
      init_log();
      RT_HOST = "rt.yapper.website";
      frameListeners = /* @__PURE__ */ new Set();
      outgoingInterceptors = /* @__PURE__ */ new Set();
      installed = false;
      origSend = null;
    }
  });

  // src/core/dom.js
  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === "class") node.className = v;
        else if (k === "html") node.innerHTML = v;
        else if (k === "style" && typeof v === "object") Object.assign(node.style, v);
        else if (k === "dataset" && typeof v === "object") Object.assign(node.dataset, v);
        else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v);
      }
    }
    for (const c of children.flat(Infinity)) {
      if (c == null || c === false) continue;
      node.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return node;
  }
  function svg(pathHtml, size = 18) {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("width", size);
    s.setAttribute("height", size);
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("fill", "none");
    s.setAttribute("stroke", "currentColor");
    s.setAttribute("stroke-width", "2");
    s.setAttribute("stroke-linecap", "round");
    s.setAttribute("stroke-linejoin", "round");
    s.innerHTML = pathHtml;
    return s;
  }
  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function getFiber(node) {
    if (!node) return null;
    const key = Object.keys(node).find(
      (k) => k.startsWith("__reactFiber$") || k.startsWith("__reactInternalInstance$")
    );
    return key ? node[key] : null;
  }
  function messageFromNode(node) {
    let fiber = getFiber(node);
    for (let i = 0; i < 16 && fiber; i++) {
      const props = fiber.memoizedProps;
      if (props && props.message && typeof props.message === "object" && props.message.id) {
        return props.message;
      }
      fiber = fiber.return;
    }
    return null;
  }
  function observe(selector, fn, root = document) {
    const seen = /* @__PURE__ */ new WeakSet();
    const process2 = (scope) => {
      let nodes;
      try {
        nodes = scope.matches?.(selector) ? [scope] : scope.querySelectorAll?.(selector) || [];
      } catch {
        return;
      }
      for (const node of nodes) {
        if (seen.has(node)) continue;
        seen.add(node);
        try {
          fn(node);
        } catch (e) {
        }
      }
    };
    process2(root);
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        for (const n of m.addedNodes) {
          if (n.nodeType === 1) process2(n);
        }
      }
    });
    mo.observe(root === document ? document.documentElement : root, { childList: true, subtree: true });
    observers.add(mo);
    return () => {
      mo.disconnect();
      observers.delete(mo);
    };
  }
  function setNativeValue(input, value) {
    const proto = input.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    if (setter) setter.call(input, value);
    else input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }
  function disconnectAll() {
    for (const mo of observers) mo.disconnect();
    observers.clear();
  }
  var observers, composer;
  var init_dom = __esm({
    "src/core/dom.js"() {
      observers = /* @__PURE__ */ new Set();
      composer = {
        box() {
          return document.querySelector(".composer");
        },
        input() {
          return document.querySelector(
            '.composer textarea, .composer [contenteditable="true"], .composer input[type="text"]'
          );
        },
        value() {
          const i = this.input();
          return i ? "value" in i ? i.value : i.textContent : "";
        }
      };
    }
  });

  // src/core/messages.js
  var messages_exports = {};
  __export(messages_exports, {
    get: () => get,
    onDelete: () => onDelete,
    onEdit: () => onEdit,
    onMessageNode: () => onMessageNode,
    start: () => start
  });
  function remember(msg) {
    if (!msg || !msg.id) return;
    const prev = cache.get(msg.id);
    if (!prev) {
      cache.set(msg.id, {
        id: msg.id,
        content: msg.content ?? "",
        author_id: msg.author_id,
        channel_id: msg.channel_id,
        created_at: msg.created_at,
        edits: [],
        deleted: false
      });
      order.push(msg.id);
      if (order.length > MAX) {
        const old = order.shift();
        if (old) cache.delete(old);
      }
      return;
    }
    if (typeof msg.content === "string" && msg.content !== prev.content && !prev.deleted) {
      const oldContent = prev.content;
      prev.edits.push({ at: Date.now(), from: oldContent, to: msg.content });
      prev.content = msg.content;
      for (const fn of editListeners) {
        try {
          fn({ id: msg.id, channel_id: msg.channel_id, oldContent, newContent: msg.content, record: prev });
        } catch {
        }
      }
    }
  }
  function scanStore() {
    const s = state();
    for (const list of Object.values(s.messages || {})) {
      for (const msg of list) remember(msg);
    }
  }
  function markDeleted(id, channelId) {
    const rec = cache.get(id);
    if (!rec || rec.deleted) return;
    rec.deleted = true;
    rec.deletedAt = Date.now();
    if (channelId) rec.channel_id = channelId;
    for (const fn of deleteListeners) {
      try {
        fn(rec);
      } catch {
      }
    }
  }
  function start() {
    if (started) return;
    started = true;
    scanStore();
    subscribe(() => scanStore());
    window.addEventListener("yapper:message-removed", (ev) => {
      const id = ev.detail;
      if (id) markDeleted(id, cache.get(id)?.channel_id);
    });
    onFrame((frame) => {
      const p = frame?.payload;
      if (frame?.type !== "event" || !p || p.table !== "messages") return;
      if (p.operation === "DELETE") {
        const id = p.old_record?.id;
        if (id) markDeleted(id, p.old_record?.channel_id);
      } else if (p.operation === "INSERT" && p.record) {
        remember(p.record);
      }
    });
    log("message cache started");
  }
  function get(id) {
    return cache.get(id);
  }
  function onEdit(fn) {
    editListeners.add(fn);
    return () => editListeners.delete(fn);
  }
  function onDelete(fn) {
    deleteListeners.add(fn);
    return () => deleteListeners.delete(fn);
  }
  function onMessageNode(fn) {
    nodeDecorators.add(fn);
    const stop = observe(".msg[data-message-id]", (node) => {
      const id = node.getAttribute("data-message-id");
      const msg = id && (findMessage(id) || cache.get(id)) || null;
      try {
        fn(node, msg);
      } catch {
      }
    });
    return () => {
      nodeDecorators.delete(fn);
      stop();
    };
  }
  var MAX, cache, order, editListeners, deleteListeners, nodeDecorators, started;
  var init_messages = __esm({
    "src/core/messages.js"() {
      init_store();
      init_realtime();
      init_dom();
      init_log();
      MAX = 4e3;
      cache = /* @__PURE__ */ new Map();
      order = [];
      editListeners = /* @__PURE__ */ new Set();
      deleteListeners = /* @__PURE__ */ new Set();
      nodeDecorators = /* @__PURE__ */ new Set();
      started = false;
    }
  });

  // src/core/settings.js
  var settings_exports = {};
  __export(settings_exports, {
    exportAll: () => exportAll,
    getPref: () => getPref,
    importAll: () => importAll,
    isPluginEnabled: () => isPluginEnabled,
    migrateLegacy: () => migrateLegacy,
    onChange: () => onChange,
    pluginOptions: () => pluginOptions,
    prefs: () => prefs,
    raw: () => raw2,
    removeRaw: () => removeRaw,
    setPluginEnabled: () => setPluginEnabled,
    setPluginOption: () => setPluginOption,
    setPref: () => setPref,
    setRaw: () => setRaw
  });
  function readJSON(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v == null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  }
  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
    }
  }
  function migrateLegacy() {
    try {
      if (localStorage.getItem(PREFIX2 + "migrated.v2")) return;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("yakazt.")) {
          const nk = PREFIX2 + k.slice("yakazt.".length);
          if (localStorage.getItem(nk) === null) {
            localStorage.setItem(nk, localStorage.getItem(k));
          }
        }
      }
      localStorage.setItem(PREFIX2 + "migrated.v2", "1");
    } catch {
    }
  }
  function prefs() {
    return { ...PREF_DEFAULTS, ...readJSON(PREFIX2 + "prefs", {}) };
  }
  function getPref(key) {
    return prefs()[key];
  }
  function setPref(key, value) {
    const p = readJSON(PREFIX2 + "prefs", {});
    p[key] = value;
    writeJSON(PREFIX2 + "prefs", p);
    emit();
  }
  function isPluginEnabled(id, defaultOn) {
    try {
      const v = localStorage.getItem(PREFIX2 + "plugin." + id);
      if (v === "1") return true;
      if (v === "0") return false;
    } catch {
    }
    return defaultOn !== false;
  }
  function setPluginEnabled(id, on) {
    try {
      localStorage.setItem(PREFIX2 + "plugin." + id, on ? "1" : "0");
    } catch {
    }
  }
  function pluginOptions(plugin) {
    const all2 = readJSON(PREFIX2 + "plugin-opts", {});
    const stored = all2[plugin.id] || {};
    const out = {};
    for (const def of plugin.settings || []) {
      out[def.id] = def.id in stored ? stored[def.id] : def.default;
    }
    return out;
  }
  function setPluginOption(pluginId, optId, value) {
    const all2 = readJSON(PREFIX2 + "plugin-opts", {});
    if (!all2[pluginId]) all2[pluginId] = {};
    all2[pluginId][optId] = value;
    writeJSON(PREFIX2 + "plugin-opts", all2);
    emit();
  }
  function raw2(key, fallback) {
    return readJSON(PREFIX2 + key, fallback);
  }
  function setRaw(key, value) {
    writeJSON(PREFIX2 + key, value);
  }
  function removeRaw(key) {
    try {
      localStorage.removeItem(PREFIX2 + key);
    } catch {
    }
  }
  function onChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }
  function emit() {
    for (const fn of listeners) {
      try {
        fn();
      } catch {
      }
    }
  }
  function exportAll() {
    const out = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(PREFIX2)) out[k] = localStorage.getItem(k);
      }
    } catch {
    }
    return out;
  }
  function importAll(data, { plugins: plugins2 = true, themes = true, prefs: wantPrefs = true } = {}) {
    if (!data || typeof data !== "object") return;
    for (const [k, v] of Object.entries(data)) {
      if (!k.startsWith(PREFIX2)) continue;
      const isTheme = k.startsWith(PREFIX2 + "theme") || k.startsWith(PREFIX2 + "quickcss");
      const isPlugin = k.startsWith(PREFIX2 + "plugin");
      const isPref = k === PREFIX2 + "prefs";
      if (isTheme && !themes || isPlugin && !plugins2 || isPref && !wantPrefs) continue;
      try {
        localStorage.setItem(k, v);
      } catch {
      }
    }
    emit();
  }
  var PREFIX2, PREF_DEFAULTS, listeners;
  var init_settings = __esm({
    "src/core/settings.js"() {
      PREFIX2 = "venper.";
      PREF_DEFAULTS = {
        toasts: true,
        toastSounds: false,
        comfySettings: true,
        // the "wider, taller settings window" the user likes
        settingsScale: 1,
        // extra size multiplier for the comfy settings window
        devMode: false
      };
      listeners = /* @__PURE__ */ new Set();
    }
  });

  // src/core/plugins.js
  var plugins_exports = {};
  __export(plugins_exports, {
    all: () => all,
    commands: () => commands,
    get: () => get2,
    isEnabled: () => isEnabled,
    onChange: () => onChange2,
    options: () => options,
    register: () => register,
    registerAll: () => registerAll,
    restart: () => restart,
    setEnabled: () => setEnabled,
    startEnabled: () => startEnabled,
    stats: () => stats
  });
  function register(plugin) {
    if (!plugin || !plugin.id) {
      warn("ignored a plugin with no id", plugin);
      return;
    }
    if (byId.has(plugin.id)) {
      warn("duplicate plugin id", plugin.id);
      return;
    }
    plugin.enabled = isPluginEnabled(plugin.id, plugin.defaultOn);
    plugins.push(plugin);
    byId.set(plugin.id, plugin);
  }
  function registerAll(list) {
    for (const p of list) register(p);
  }
  function startEnabled() {
    for (const p of plugins) {
      if (p.enabled) safeStart(p);
    }
    log(`started ${plugins.filter((p) => p.enabled).length}/${plugins.length} plugins`);
  }
  function context(plugin) {
    return {
      options: () => pluginOptions(plugin),
      setOption: (id, v) => setPluginOption(plugin.id, id, v),
      logger: log.for(plugin.name || plugin.id)
    };
  }
  function safeStart(plugin) {
    if (plugin.__started) return;
    try {
      plugin.start?.(context(plugin));
      plugin.__started = true;
    } catch (e) {
      error(`plugin "${plugin.id}" failed to start`, e);
    }
  }
  function safeStop(plugin) {
    if (!plugin.__started) return;
    try {
      plugin.stop?.();
    } catch (e) {
      error(`plugin "${plugin.id}" failed to stop`, e);
    }
    plugin.__started = false;
  }
  function setEnabled(id, on) {
    const plugin = byId.get(id);
    if (!plugin) return;
    plugin.enabled = !!on;
    setPluginEnabled(id, plugin.enabled);
    if (on) safeStart(plugin);
    else safeStop(plugin);
    emitChange();
  }
  function restart(id) {
    const plugin = byId.get(id);
    if (!plugin || !plugin.enabled) return;
    safeStop(plugin);
    safeStart(plugin);
    emitChange();
  }
  function all() {
    return plugins.slice();
  }
  function get2(id) {
    return byId.get(id);
  }
  function isEnabled(id) {
    return !!byId.get(id)?.enabled;
  }
  function options(id) {
    const p = byId.get(id);
    return p ? pluginOptions(p) : {};
  }
  function onChange2(fn) {
    changeListeners.add(fn);
    return () => changeListeners.delete(fn);
  }
  function emitChange() {
    for (const fn of changeListeners) {
      try {
        fn();
      } catch {
      }
    }
  }
  function commands() {
    const out = [];
    for (const p of plugins) {
      if (!p.enabled || !p.commands) continue;
      for (const c of p.commands) {
        out.push({ ...c, plugin: p });
      }
    }
    return out;
  }
  function stats() {
    return {
      total: plugins.length,
      enabled: plugins.filter((p) => p.enabled).length
    };
  }
  var plugins, byId, changeListeners;
  var init_plugins = __esm({
    "src/core/plugins.js"() {
      init_settings();
      init_log();
      plugins = [];
      byId = /* @__PURE__ */ new Map();
      changeListeners = /* @__PURE__ */ new Set();
    }
  });

  // src/core/ui/contextMenu.js
  function onMessageMenu(fn) {
    messageContributors.add(fn);
    return () => messageContributors.delete(fn);
  }
  function buttonLike(menu) {
    const sample = menu.querySelector("button:not(.danger)") || menu.querySelector("button");
    return sample ? sample.className : "";
  }
  function build(menu, message) {
    if (!messageContributors.size) return;
    const cls = buttonLike(menu);
    const section = el("div", { class: "vnp-ctx-section", "data-venper": "1" });
    let count = 0;
    const api = {
      message,
      item({ label, icon, danger, onClick, disabled }) {
        const btn = el(
          "button",
          {
            class: (cls || "") + (danger ? " danger" : "") + " vnp-ctx-item",
            disabled: disabled || void 0,
            onclick: (ev) => {
              ev.stopPropagation();
              closeMenu();
              try {
                onClick?.();
              } catch {
              }
            }
          },
          // Same shape as Yapper's own items: label first, icon on the right.
          el("span", {}, label),
          icon ? svg(icon, 18) : null
        );
        section.appendChild(btn);
        count++;
        return btn;
      },
      separator() {
        section.appendChild(el("div", { class: "sep", "data-venper": "1" }));
      }
    };
    for (const fn of messageContributors) {
      try {
        fn(message, api);
      } catch {
      }
    }
    if (count > 0) {
      if (menu.querySelector("button, .sep")) {
        section.insertBefore(el("div", { class: "sep", "data-venper": "1" }), section.firstChild);
      }
      menu.appendChild(section);
      keepOnScreen(menu);
    }
  }
  function closeMenu() {
    if (!document.querySelector(".ctx-menu")) return;
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", code: "Escape", keyCode: 27, bubbles: true, cancelable: true })
    );
  }
  function keepOnScreen(menu) {
    const pad = 8;
    let mo = null;
    let ro = null;
    const fit = () => {
      if (!menu.isConnected) {
        mo?.disconnect();
        ro?.disconnect();
        return;
      }
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const cs = getComputedStyle(menu);
      const rect = menu.getBoundingClientRect();
      const top = Number.isFinite(parseFloat(cs.top)) ? parseFloat(cs.top) : rect.top;
      const left = Number.isFinite(parseFloat(cs.left)) ? parseFloat(cs.left) : rect.left;
      if (menu.offsetHeight > vh - pad * 2 && menu.style.overflowY !== "auto") {
        menu.style.maxHeight = vh - pad * 2 + "px";
        menu.style.overflowY = "auto";
      }
      const h = Math.min(menu.offsetHeight, vh - pad * 2);
      const w = menu.offsetWidth;
      if (top + h > vh - pad + 0.5) menu.style.top = Math.max(pad, vh - h - pad) + "px";
      if (left + w > vw - pad + 0.5) menu.style.left = Math.max(pad, vw - w - pad) + "px";
    };
    mo = new MutationObserver(fit);
    mo.observe(menu, { attributes: true, attributeFilter: ["style"] });
    if (typeof ResizeObserver === "function") {
      ro = new ResizeObserver(fit);
      ro.observe(menu);
    }
    fit();
  }
  function start2() {
    if (started2) return;
    started2 = true;
    observe(".ctx-menu", (menu) => {
      const id = state().menu?.messageId;
      let message = id ? findMessage(id) : null;
      if (!message) {
        const open3 = document.querySelector(".msg.menu-open[data-message-id]");
        if (open3) message = messageFromNode(open3);
      }
      if (message) build(menu, message);
    });
  }
  var messageContributors, started2;
  var init_contextMenu = __esm({
    "src/core/ui/contextMenu.js"() {
      init_dom();
      init_store();
      messageContributors = /* @__PURE__ */ new Set();
      started2 = false;
    }
  });

  // src/core/ui/style.js
  function inject() {
    if (injected) return;
    injected = true;
    const style = document.createElement("style");
    style.id = "venper-base-css";
    style.textContent = CSS;
    (document.head || document.documentElement).appendChild(style);
  }
  function setStyle(id, css) {
    let node = document.getElementById(id);
    if (!css) {
      node?.remove();
      return;
    }
    if (!node) {
      node = document.createElement("style");
      node.id = id;
      (document.head || document.documentElement).appendChild(node);
    }
    node.textContent = css;
  }
  var injected, CSS;
  var init_style = __esm({
    "src/core/ui/style.js"() {
      injected = false;
      CSS = String.raw`
:root { --vnp-accent: #8b7af0; }

/* Venper uses Yapper's accent when present, its own violet otherwise. */
.vnp-scope, #venper-panel, .vnp-toast, .vnp-modal, .vnp-ctx { --vnp: var(--accent, var(--vnp-accent)); }

/* ---- motion ---- */
@keyframes vnp-fade-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes vnp-pop-in { from { opacity: 0; transform: translateY(8px) scale(.98) } to { opacity: 1; transform: none } }
@keyframes vnp-toast-in { from { opacity: 0; transform: translateX(26px) scale(.96) } to { opacity: 1; transform: none } }
@keyframes vnp-toast-out { to { opacity: 0; transform: translateX(26px) scale(.96) } }
@keyframes vnp-spin { to { transform: rotate(360deg) } }
@keyframes vnp-rise { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }
@media (prefers-reduced-motion: reduce) {
  .vnp-toast, .vnp-modal, .vnp-ctx, #venper-panel * { animation: none !important; }
}

/* ---- toasts ---- */
#vnp-toasts {
  position: fixed; right: 18px; bottom: 18px; z-index: 2147483000;
  display: flex; flex-direction: column; gap: 10px; pointer-events: none;
  max-width: 360px;
}
.vnp-toast {
  pointer-events: auto; display: flex; gap: 11px; align-items: flex-start;
  background: var(--bg-float, var(--bg-elev, #1b1c21)); color: var(--text, #ececf1);
  border: 1px solid var(--border, #ffffff14); border-left: 3px solid var(--vnp);
  border-radius: 12px; padding: 12px 14px; box-shadow: 0 10px 34px #0007;
  animation: vnp-toast-in .26s cubic-bezier(.2,.8,.2,1);
  font: 14px/1.4 var(--font, "Inter", system-ui, sans-serif);
}
.vnp-toast.vnp-out { animation: vnp-toast-out .22s ease forwards; }
.vnp-toast-ico { flex: none; width: 30px; height: 30px; border-radius: 9px; display: grid; place-items: center; color: #fff; background: var(--vnp); }
.vnp-toast-body { flex: 1; min-width: 0; }
.vnp-toast-title { font-weight: 650; }
.vnp-toast-msg { color: var(--text-muted, #9c9daa); font-size: 13px; margin-top: 2px; word-wrap: break-word; }
.vnp-toast-actions { display: flex; gap: 8px; margin-top: 9px; }
.vnp-toast-x { flex: none; background: none; border: 0; color: var(--text-faint, #6e6f7b); cursor: pointer; font-size: 18px; line-height: 1; padding: 0 2px; }
.vnp-toast-x:hover { color: var(--text, #fff); }

/* ---- buttons (shared) ---- */
.vnp-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  background: var(--bg-elev, #2b2c33); color: var(--text, #fff);
  border: 1px solid var(--border, #ffffff14); border-radius: 9px;
  padding: 8px 14px; font: 600 13px var(--font, "Inter", sans-serif); cursor: pointer;
  transition: background .14s, border-color .14s, transform .08s; white-space: nowrap;
}
.vnp-btn:hover { background: var(--bg-hover, #2f3038); border-color: var(--vnp); }
.vnp-btn:active { transform: translateY(1px); }
.vnp-btn.vnp-primary { background: var(--vnp); border-color: transparent; color: var(--on-accent, #fff); }
.vnp-btn.vnp-primary:hover { filter: brightness(1.08); }
.vnp-btn.vnp-danger { color: var(--danger, #e85a60); border-color: var(--danger, #e85a60); background: transparent; }
.vnp-btn.vnp-danger:hover { background: color-mix(in srgb, var(--danger, #e85a60) 16%, transparent); }
.vnp-btn.vnp-small { padding: 5px 10px; font-size: 12px; border-radius: 7px; }
.vnp-btn:disabled { opacity: .5; cursor: not-allowed; }

/* ---- toggle switch ---- */
.vnp-switch { position: relative; width: 42px; height: 24px; border-radius: 99px; background: #4e5058; cursor: pointer; flex: none; transition: background .18s; }
.vnp-switch::after { content: ""; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 99px; background: #fff; transition: left .18s cubic-bezier(.4,1.3,.5,1); box-shadow: 0 1px 3px #0005; }
.vnp-switch.vnp-on { background: var(--vnp); }
.vnp-switch.vnp-on::after { left: 21px; }

/* ---- generic spinner ---- */
.vnp-spin { width: 16px; height: 16px; border: 2px solid var(--border, #fff3); border-top-color: var(--vnp); border-radius: 50%; animation: vnp-spin .7s linear infinite; }

/* ---- context-menu extras ---- */
/* Context-menu items borrow Yapper's own button class, so they need no layout
   rules of their own; this only keeps the icon from shrinking. */
.vnp-ctx-item > svg { flex: none; }
`;
    }
  });

  // src/core/themes.js
  var themes_exports = {};
  __export(themes_exports, {
    ACCENT_PRESETS: () => ACCENT_PRESETS,
    apply: () => apply,
    getAccent: () => getAccent,
    getQuickCss: () => getQuickCss,
    setAccent: () => setAccent,
    setQuickCss: () => setQuickCss
  });
  function getQuickCss() {
    return raw2("quickcss", "") || "";
  }
  function setQuickCss(css) {
    setRaw("quickcss", css);
    applyQuickCss();
  }
  function applyQuickCss() {
    setStyle("venper-quickcss", getQuickCss());
  }
  function getAccent() {
    return raw2("theme.accent", "yapper");
  }
  function setAccent(id) {
    setRaw("theme.accent", id);
    applyAccent();
  }
  function applyAccent() {
    const id = getAccent();
    const preset = ACCENT_PRESETS.find((p) => p.id === id);
    if (!preset || !preset.color) {
      setStyle("venper-accent", "");
      return;
    }
    setStyle(
      "venper-accent",
      `:root, :root[data-theme=light] {
       --accent: ${preset.color} !important;
       --accent-hover: color-mix(in srgb, ${preset.color} 85%, #fff) !important;
       --accent-soft: color-mix(in srgb, ${preset.color} 18%, transparent) !important;
     }`
    );
  }
  function apply() {
    applyQuickCss();
    applyAccent();
  }
  var ACCENT_PRESETS;
  var init_themes = __esm({
    "src/core/themes.js"() {
      init_style();
      init_settings();
      ACCENT_PRESETS = [
        { id: "violet", label: "Venper Violet", color: "#8b7af0" },
        { id: "yapper", label: "Yapper (default)", color: "" },
        { id: "blurple", label: "Blurple", color: "#5865f2" },
        { id: "rose", label: "Rose", color: "#f04a74" },
        { id: "amber", label: "Amber", color: "#f0a63a" },
        { id: "emerald", label: "Emerald", color: "#2fbf71" },
        { id: "sky", label: "Sky", color: "#36a6f0" },
        { id: "crimson", label: "Crimson", color: "#e23b3b" }
      ];
    }
  });

  // src/core/ui/toast.js
  function host() {
    let h = document.getElementById("vnp-toasts");
    if (!h) {
      h = el("div", { id: "vnp-toasts", class: "vnp-scope" });
      document.body.appendChild(h);
    }
    return h;
  }
  function toast(title, message = "", opts = {}) {
    if (getPref("toasts") === false && !opts.important) return () => {
    };
    const h = host();
    while (h.children.length >= 4) h.firstChild?.remove();
    const card = el("div", { class: "vnp-toast", role: "status" });
    const ico = el("div", { class: "vnp-toast-ico" });
    if (opts.color) ico.style.background = opts.color;
    ico.append(svg(opts.icon || BELL, 18));
    const body = el("div", { class: "vnp-toast-body" });
    body.append(el("div", { class: "vnp-toast-title" }, title));
    if (message) body.append(el("div", { class: "vnp-toast-msg", html: escapeHtml(message) }));
    const actions = (opts.actions || []).slice(0, 2);
    if (actions.length) {
      const row2 = el("div", { class: "vnp-toast-actions" });
      for (const a of actions) {
        row2.append(
          el(
            "button",
            {
              class: "vnp-btn vnp-small" + (a.primary === false ? "" : " vnp-primary"),
              onclick: (ev) => {
                ev.stopPropagation();
                dismiss();
                try {
                  a.onClick?.();
                } catch {
                }
              }
            },
            a.label || "Open"
          )
        );
      }
      body.append(row2);
    }
    const close2 = el("button", { class: "vnp-toast-x", "aria-label": "Dismiss" }, "×");
    card.append(ico, body, close2);
    let gone = false;
    let timer;
    function dismiss() {
      if (gone) return;
      gone = true;
      clearTimeout(timer);
      card.classList.add("vnp-out");
      setTimeout(() => card.remove(), 240);
    }
    close2.addEventListener("click", (e) => {
      e.stopPropagation();
      dismiss();
    });
    h.appendChild(card);
    const ms = opts.timeout ?? 5200;
    if (ms > 0) timer = setTimeout(dismiss, ms);
    return dismiss;
  }
  var BELL, colors;
  var init_toast = __esm({
    "src/core/ui/toast.js"() {
      init_dom();
      init_settings();
      BELL = '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>';
      colors = {
        accent: void 0,
        // uses --vnp
        danger: "#e85a60",
        success: "#4ace8c",
        warning: "#f0b648"
      };
    }
  });

  // src/core/ui/panelWidgets.js
  function switchEl(on, onChange3) {
    const s = el("div", {
      class: "vnp-switch" + (on ? " vnp-on" : ""),
      role: "switch",
      tabindex: "0",
      "aria-checked": on ? "true" : "false"
    });
    const flip = () => {
      const v = !s.classList.contains("vnp-on");
      s.classList.toggle("vnp-on", v);
      s.setAttribute("aria-checked", v ? "true" : "false");
      onChange3(v);
    };
    s.addEventListener("click", flip);
    s.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        flip();
      }
    });
    return s;
  }
  function row(title, desc, control) {
    const r = el("div", { class: "vnp-row" });
    const text = el("div", { class: "vnp-row-text" });
    text.append(el("div", { class: "vnp-row-title" }, title));
    if (desc) text.append(el("div", { class: "vnp-row-desc" }, desc));
    r.append(text);
    if (control) r.append(control);
    return r;
  }
  function dropdown(value, options2, onChange3) {
    const sel = el("select", { class: "vnp-select" });
    for (const opt of options2) {
      const o = el("option", { value: opt.value }, opt.label);
      if (opt.value === value) o.selected = true;
      sel.append(o);
    }
    sel.addEventListener("change", () => onChange3(sel.value));
    return sel;
  }
  function slider(value, { min = 0, max = 100, step = 1, suffix = "" }, onChange3) {
    const wrap = el("div", { class: "vnp-slider-wrap" });
    const input = el("input", { type: "range", class: "vnp-slider", min, max, step, value });
    const label = el("span", { class: "vnp-slider-val" }, String(value) + suffix);
    input.addEventListener("input", () => {
      label.textContent = input.value + suffix;
      onChange3(Number(input.value));
    });
    wrap.append(input, label);
    return wrap;
  }
  function textInput(value, placeholder, onChange3, { area = false } = {}) {
    const input = el(area ? "textarea" : "input", {
      class: area ? "vnp-area" : "vnp-input",
      placeholder: placeholder || ""
    });
    input.value = value || "";
    input.addEventListener("change", () => onChange3(input.value));
    if (area) input.addEventListener("input", () => onChange3(input.value));
    return input;
  }
  function button(label, kind, onClick, icon) {
    return el(
      "button",
      { class: "vnp-btn" + (kind ? " vnp-" + kind : ""), onclick: onClick },
      icon ? svg(icon, 15) : null,
      label
    );
  }
  function sectionTitle(text, sub) {
    const wrap = el("div", { class: "vnp-sec" });
    wrap.append(el("h3", { class: "vnp-sec-title" }, text));
    if (sub) wrap.append(el("p", { class: "vnp-sec-sub" }, sub));
    return wrap;
  }
  function note(html, kind) {
    return el("div", { class: kind === "warn" ? "vnp-pnote vnp-warn" : "vnp-pnote", html });
  }
  function stat(value, label) {
    return el("div", { class: "vnp-stat" }, el("b", {}, String(value)), el("span", {}, label));
  }
  var init_panelWidgets = __esm({
    "src/core/ui/panelWidgets.js"() {
      init_dom();
    }
  });

  // src/core/ui/tabs/advanced.js
  function renderAdvanced(root, { refresh }) {
    root.append(el("h2", {}, "Advanced"));
    root.append(el("p", { class: "vnp-head-sub" }, "Fine-tune Venper. Most people never need to touch this."));
    root.append(sectionTitle("Settings window", "The roomier settings window, the way you like it."));
    root.append(
      row(
        "Comfy settings window",
        "Makes this window larger and calmer. Turn off for Yapper's default size.",
        switchEl(getPref("comfySettings") !== false, (v) => setPref("comfySettings", v))
      )
    );
    root.append(
      row(
        "Window size",
        "Scale the comfy window up or down to fit your screen.",
        slider(
          Math.round((getPref("settingsScale") || 1) * 100),
          { min: 85, max: 130, step: 5, suffix: "%" },
          (v) => setPref("settingsScale", v / 100)
        )
      )
    );
    root.append(sectionTitle("Notifications"));
    root.append(
      row(
        "Venper toasts",
        "Show Venper's own pop-up notifications (plugin messages, confirmations).",
        switchEl(getPref("toasts") !== false, (v) => setPref("toasts", v))
      )
    );
    root.append(sectionTitle("Developer"));
    root.append(
      row(
        "Developer mode",
        "Extra logging in the console and developer-only plugin options.",
        switchEl(!!getPref("devMode"), (v) => setPref("devMode", v))
      )
    );
    const devRow = el("div", { class: "vnp-btnrow" });
    if (isDesktop()) {
      devRow.append(
        button("Open DevTools", null, () => {
          location.href = "venper://devtools";
          toast("DevTools", "Opening the debugger for the app.", { timeout: 3e3 });
        })
      );
      devRow.append(
        button("Restart Yapper", null, () => {
          location.href = "venper://restart";
        })
      );
    } else {
      devRow.append(button("Open DevTools", null, () => toast("DevTools", "Press F12 in your browser to open DevTools.", { timeout: 3500 })));
    }
    root.append(devRow);
    root.append(sectionTitle("Reset"));
    root.append(note("This clears all Venper settings, plugin states and themes on this device. Your Yapper account is untouched.", "warn"));
    const resetRow = el("div", { class: "vnp-btnrow" });
    resetRow.append(
      button("Reset Venper to defaults", "danger", () => {
        if (!confirm("Reset all Venper settings to defaults? This can't be undone.")) return;
        factoryReset();
        toast("Venper reset", "Reload Yapper to finish.", { color: colors.warning, important: true, timeout: 8e3 });
      })
    );
    root.append(resetRow);
  }
  function factoryReset(silent) {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("venper.")) keys.push(k);
      }
      for (const k of keys) localStorage.removeItem(k);
    } catch {
    }
    if (!silent) setTimeout(() => location.reload(), 1200);
  }
  var isDesktop;
  var init_advanced = __esm({
    "src/core/ui/tabs/advanced.js"() {
      init_dom();
      init_settings();
      init_toast();
      init_panelWidgets();
      isDesktop = () => !!window.__VENPER_DESKTOP__;
    }
  });

  // src/plugins/messageLogger.js
  function markGhost(node, kind) {
    node.setAttribute("data-vnp-ghost", kind);
    const host2 = markerHost(node);
    if (host2 && !node.querySelector(".vnp-deleted-tag")) {
      host2.appendChild(el("span", { class: "vnp-deleted-tag" }, "deleted"));
    }
  }
  function prevMessageId(node) {
    for (let n = node, i = 0; n && i < 50; n = n.previousSibling, i++) {
      if (n.nodeType === 1 && n.matches?.(".msg[data-message-id]")) return n.getAttribute("data-message-id");
    }
    return null;
  }
  function markerHost(node) {
    return node.querySelector(".msg-head") || node.querySelector(".msg-text");
  }
  function historyHtml(rec) {
    return rec.edits.map((e) => {
      const t = new Date(e.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      return `<div><span class="vnp-eh-time">${t}</span> <span class="vnp-eh-old">${escapeHtml(e.from)}</span></div>`;
    }).join("");
  }
  function cssEscape(s) {
    return String(s).replace(/["\\]/g, "\\$&");
  }
  var CSS2, messageLogger_default;
  var init_messageLogger = __esm({
    "src/plugins/messageLogger.js"() {
      init_messages();
      init_store();
      init_dom();
      init_style();
      CSS2 = `
.msg[data-vnp-ghost] .msg-text, .msg[data-vnp-ghost] .msg-text * { color: var(--danger, #f04b4b) !important; }
.msg[data-vnp-ghost] .msg-author { color: var(--danger, #f04b4b) !important; }
.vnp-deleted-tag { font-size: 10.5px; font-weight: 700; color: var(--danger, #f04b4b); background: color-mix(in srgb, var(--danger, #f04b4b) 16%, transparent); border-radius: 5px; padding: 0 6px; margin-left: 7px; vertical-align: middle; }
.vnp-edited-badge { font-size: 10.5px; color: var(--text-faint, #888); margin-left: 6px; cursor: pointer; text-decoration: underline dotted; }
.vnp-edit-history { margin-top: 4px; border-left: 2px solid var(--border, #3f4147); padding-left: 8px; font-size: 12px; color: var(--text-muted, #9c9daa); }
.vnp-edit-history .vnp-eh-old { color: var(--text-faint, #888); text-decoration: line-through; }
.vnp-edit-history .vnp-eh-time { font-size: 10.5px; color: var(--text-faint, #888); opacity: .8; }
`;
      messageLogger_default = {
        id: "messagelogger",
        name: "MessageLogger",
        description: "Deleted messages stay visible in red, and edited messages get a history you can expand. Fully local.",
        authors: ["yakazt"],
        tags: ["Chat", "Privacy"],
        defaultOn: true,
        _stops: [],
        _ghosts: /* @__PURE__ */ new Map(),
        // id -> { channelId, prevId, template }  deleted messages to keep showing
        _recent: /* @__PURE__ */ new Map(),
        // id -> { node, prevId, at }  rows the app removed in the last few seconds
        _mo: null,
        _pending: 0,
        start() {
          setStyle("venper-messagelogger-css", CSS2);
          this._stops.push(
            onMessageNode((node, msg) => {
              if (msg) this._decorateEdits(node, msg.id);
            })
          );
          this._stops.push(
            onEdit(({ id }) => {
              requestAnimationFrame(() => {
                const node = document.querySelector(`.msg[data-message-id="${cssEscape(id)}"]`);
                if (node) this._decorateEdits(node, id);
              });
            })
          );
          this._stops.push(onDelete((rec) => this._onDeleted(rec)));
          this._mo = new MutationObserver((muts) => this._onMutations(muts));
          this._stops.push(
            observe(".messages", (list) => {
              this._mo.observe(list, { childList: true, subtree: true });
              this._scheduleRestore();
            })
          );
        },
        _onDeleted(rec) {
          const live = document.querySelector(`.msg[data-message-id="${cssEscape(rec.id)}"]`);
          if (live) {
            markGhost(live, "1");
            this._remember(rec.id, rec.channel_id, prevMessageId(live.previousElementSibling), live);
          } else if (this._recent.has(rec.id)) {
            const r = this._recent.get(rec.id);
            this._recent.delete(rec.id);
            this._remember(rec.id, rec.channel_id, r.prevId, r.node);
          }
          this._scheduleRestore();
        },
        _remember(id, channelId, prevId, node) {
          const template = node.cloneNode(true);
          markGhost(template, "clone");
          template.querySelectorAll(".vnp-edit-history").forEach((n) => n.remove());
          this._ghosts.set(id, { channelId, prevId, template });
          while (this._ghosts.size > 300) this._ghosts.delete(this._ghosts.keys().next().value);
        },
        _onMutations(muts) {
          const now = Date.now();
          for (const m of muts) {
            for (const n of m.removedNodes) {
              if (n.nodeType !== 1 || !n.matches?.(".msg[data-message-id]")) continue;
              const id = n.getAttribute("data-message-id");
              if (this._ghosts.has(id)) continue;
              const prevId = prevMessageId(m.previousSibling);
              const rec = get(id);
              if (rec?.deleted) this._remember(id, rec.channel_id, prevId, n);
              else this._recent.set(id, { node: n, prevId, at: now });
            }
          }
          for (const [id, r] of this._recent) if (now - r.at > 4e3) this._recent.delete(id);
          if (this._ghosts.size) this._scheduleRestore();
        },
        _scheduleRestore() {
          if (this._pending) return;
          this._pending = requestAnimationFrame(() => {
            this._pending = 0;
            this._restore();
          });
        },
        // Put every ghost for the open channel back after the message it followed,
        // if that message is on screen. Re-runs after channel switches and
        // re-renders, so ghosts survive both.
        _restore() {
          const active = activeChannelId();
          const elsewhere = (g) => g.channelId && active && g.channelId !== active;
          for (const copy of document.querySelectorAll('.msg[data-vnp-ghost="clone"]')) {
            const g = this._ghosts.get(copy.getAttribute("data-message-id"));
            if (!g || elsewhere(g)) copy.remove();
          }
          for (const [id, g] of this._ghosts) {
            if (elsewhere(g)) continue;
            const rows = document.querySelectorAll(`.msg[data-message-id="${cssEscape(id)}"]`);
            if ([...rows].some((n) => n.getAttribute("data-vnp-ghost") !== "clone")) continue;
            const copy = rows[0] || null;
            const anchor = g.prevId && document.querySelector(`.msg[data-message-id="${cssEscape(g.prevId)}"]`);
            if (!anchor) {
              copy?.remove();
              continue;
            }
            if (copy) {
              if (copy.previousElementSibling !== anchor) anchor.after(copy);
            } else {
              anchor.after(g.template.cloneNode(true));
            }
          }
        },
        _decorateEdits(node, id) {
          if (node.hasAttribute("data-vnp-ghost")) return;
          const rec = get(id);
          if (!rec || !rec.edits.length) return;
          const host2 = markerHost(node);
          if (!host2) return;
          const n = rec.edits.length;
          const label = n === 1 ? "1 earlier version" : n + " earlier versions";
          let badge = node.querySelector(".vnp-edited-badge");
          if (badge) {
            badge.textContent = label;
            const box = node.querySelector(".vnp-edit-history");
            if (box) box.innerHTML = historyHtml(rec);
            return;
          }
          badge = el("span", { class: "vnp-edited-badge", title: "Show edit history" }, label);
          badge.addEventListener("click", (ev) => {
            ev.stopPropagation();
            const body = node.querySelector(".msg-body") || node;
            const box = body.querySelector(".vnp-edit-history");
            if (box) {
              box.remove();
              return;
            }
            const panel = el("div", { class: "vnp-edit-history" });
            panel.innerHTML = historyHtml(get(id) || rec);
            body.appendChild(panel);
          });
          host2.appendChild(badge);
        },
        stop() {
          for (const stop of this._stops) {
            try {
              stop();
            } catch {
            }
          }
          this._stops = [];
          this._mo?.disconnect();
          cancelAnimationFrame(this._pending);
          this._pending = 0;
          this._ghosts.clear();
          this._recent.clear();
          document.querySelectorAll('[data-vnp-ghost="clone"]').forEach((n) => n.remove());
          document.querySelectorAll("[data-vnp-ghost]").forEach((n) => n.removeAttribute("data-vnp-ghost"));
          document.querySelectorAll(".vnp-deleted-tag, .vnp-edited-badge, .vnp-edit-history").forEach((n) => n.remove());
          setStyle("venper-messagelogger-css", "");
        }
      };
    }
  });

  // src/plugins/chatQol.js
  var silentTyping, timestamps, characterCounter, noCaps, showMeYourName, blockKeywords, chatQol_default;
  var init_chatQol = __esm({
    "src/plugins/chatQol.js"() {
      init_realtime();
      init_messages();
      init_store();
      init_dom();
      init_style();
      silentTyping = {
        id: "silenttyping",
        name: "SilentTyping",
        description: "Stops Yapper from telling others you're typing. You can still see everyone else's typing.",
        authors: ["yakazt"],
        tags: ["Chat", "Privacy"],
        defaultOn: false,
        _off: null,
        start() {
          this._off = onOutgoing((frame) => frame && frame.type === "typing" ? false : void 0);
        },
        stop() {
          this._off?.();
          this._off = null;
        }
      };
      timestamps = {
        id: "timestamps",
        name: "Better Timestamps",
        description: "Adds a full date-and-time tooltip to every message, and can show seconds.",
        authors: ["yakazt"],
        tags: ["Chat"],
        defaultOn: true,
        settings: [
          { id: "seconds", type: "toggle", label: "Show seconds", description: "Append seconds to message times.", default: false }
        ],
        _stop: null,
        start(ctx) {
          const seconds = ctx.options().seconds;
          this._stop = onMessageNode((node, msg) => {
            if (!msg) return;
            const timeEl = node.querySelector(".msg-time");
            if (!timeEl || timeEl.dataset.vnpTs) return;
            timeEl.dataset.vnpTs = "1";
            try {
              const d = new Date(msg.created_at);
              timeEl.title = d.toLocaleString(void 0, { dateStyle: "full", timeStyle: "medium" });
              if (seconds) {
                const withSecs = d.toLocaleTimeString(void 0, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                const extra = el("span", { class: "vnp-ts-secs", style: { opacity: ".6", marginLeft: "4px", fontSize: "11px" } }, withSecs);
                timeEl.appendChild(extra);
              }
            } catch {
            }
          });
        },
        stop() {
          this._stop?.();
          document.querySelectorAll(".vnp-ts-secs").forEach((n) => n.remove());
          document.querySelectorAll(".msg-time[data-vnp-ts]").forEach((n) => delete n.dataset.vnpTs);
        }
      };
      characterCounter = {
        id: "charcounter",
        name: "Character Counter",
        description: "Shows how many characters you've typed, in the corner of the message box.",
        authors: ["yakazt"],
        tags: ["Chat", "Utility"],
        defaultOn: false,
        _timer: null,
        start() {
          setStyle(
            "venper-charcounter-css",
            ".vnp-charcount{position:absolute;right:52px;bottom:14px;font-size:11px;color:var(--text-faint,#888);pointer-events:none;font-variant-numeric:tabular-nums;z-index:5}"
          );
          this._timer = setInterval(() => {
            const box = composer.box();
            const input = composer.input();
            if (!box || !input) return;
            let badge = box.querySelector(".vnp-charcount");
            if (!badge) {
              badge = el("div", { class: "vnp-charcount" });
              if (getComputedStyle(box).position === "static") box.style.position = "relative";
              box.appendChild(badge);
            }
            const n = (input.value || input.textContent || "").length;
            badge.textContent = n > 0 ? String(n) : "";
          }, 300);
        },
        stop() {
          clearInterval(this._timer);
          document.querySelectorAll(".vnp-charcount").forEach((n) => n.remove());
          setStyle("venper-charcounter-css", "");
        }
      };
      noCaps = {
        id: "nocaps",
        name: "No Caps",
        description: "Automatically lowercases your message before sending if it's mostly uppercase.",
        authors: ["yakazt"],
        tags: ["Chat", "Fun"],
        defaultOn: false,
        settings: [
          { id: "threshold", type: "slider", label: "Uppercase threshold", description: "Lowercase a message when at least this % of its letters are capitals.", default: 55, min: 20, max: 100, step: 5, suffix: "%" }
        ],
        _handler: null,
        start(ctx) {
          const threshold = (ctx.options().threshold || 55) / 100;
          this._handler = (e) => {
            if (e.key !== "Enter" || e.shiftKey) return;
            const input = e.target.closest?.(".composer textarea, .composer input");
            if (!input) return;
            const text = input.value || "";
            const letters = text.replace(/[^a-zA-Z]/g, "");
            if (letters.length < 4) return;
            const caps = (text.match(/[A-Z]/g) || []).length;
            if (caps / letters.length >= threshold) {
              setNativeValue(input, text.toLowerCase());
            }
          };
          document.addEventListener("keydown", this._handler, true);
        },
        stop() {
          if (this._handler) document.removeEventListener("keydown", this._handler, true);
          this._handler = null;
        }
      };
      showMeYourName = {
        id: "showmeyourname",
        name: "Show Me Your Name",
        description: "Shows a user's @username next to their display name or nickname in chat.",
        authors: ["yakazt"],
        tags: ["Chat", "Appearance"],
        defaultOn: false,
        _stop: null,
        start() {
          setStyle("venper-smyn-css", ".vnp-username{font-size:12px;color:var(--text-faint,#888);font-weight:400;margin-left:6px}");
          this._stop = onMessageNode((node, msg) => {
            if (!msg) return;
            const authorEl = node.querySelector(".msg-author");
            if (!authorEl || authorEl.querySelector(".vnp-username")) return;
            const p = profile(msg.author_id);
            if (!p || !p.username) return;
            const shown = authorEl.textContent.trim();
            if (shown.toLowerCase() === p.username.toLowerCase()) return;
            authorEl.appendChild(el("span", { class: "vnp-username" }, "@" + p.username));
          });
        },
        stop() {
          this._stop?.();
          document.querySelectorAll(".vnp-username").forEach((n) => n.remove());
          setStyle("venper-smyn-css", "");
        }
      };
      blockKeywords = {
        id: "blockkeywords",
        name: "Block Keywords",
        description: "Hides messages that contain words you'd rather not see. Local only.",
        authors: ["yakazt"],
        tags: ["Chat", "Privacy"],
        defaultOn: false,
        settings: [
          { id: "words", type: "text", label: "Keywords", description: "Comma-separated words or phrases to hide.", default: "" },
          { id: "mode", type: "select", label: "What to do", default: "blur", options: [{ value: "blur", label: "Blur (click to reveal)" }, { value: "hide", label: "Hide completely" }] }
        ],
        _stop: null,
        start(ctx) {
          const o = ctx.options();
          const words = (o.words || "").split(",").map((w) => w.trim().toLowerCase()).filter(Boolean);
          if (!words.length) return;
          setStyle(
            "venper-blockkw-css",
            ".vnp-blocked-blur .msg-text{filter:blur(6px);cursor:pointer;transition:filter .15s}.vnp-blocked-blur.vnp-revealed .msg-text{filter:none}.vnp-blocked-hide{display:none!important}"
          );
          this._stop = onMessageNode((node, msg) => {
            if (!msg || !msg.content) return;
            const lc = msg.content.toLowerCase();
            if (!words.some((w) => lc.includes(w))) return;
            if (o.mode === "hide") {
              node.classList.add("vnp-blocked-hide");
            } else {
              node.classList.add("vnp-blocked-blur");
              node.addEventListener("click", () => node.classList.add("vnp-revealed"), { once: true });
            }
          });
        },
        stop() {
          this._stop?.();
          document.querySelectorAll(".vnp-blocked-blur, .vnp-blocked-hide").forEach((n) => n.classList.remove("vnp-blocked-blur", "vnp-blocked-hide", "vnp-revealed"));
          setStyle("venper-blockkw-css", "");
        }
      };
      chatQol_default = [silentTyping, timestamps, characterCounter, noCaps, showMeYourName, blockKeywords];
    }
  });

  // src/plugins/chatSend.js
  function onComposerSend(fn) {
    const handler = (e) => {
      if (e.key !== "Enter" || e.shiftKey) return;
      const input = e.target.closest?.(".composer textarea, .composer input");
      if (!input) return;
      const text = input.value || "";
      if (!text) return;
      const next = fn(text);
      if (typeof next === "string" && next !== text) setNativeValue(input, next);
    };
    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }
  var textReplace, TRACKING, urlCleaner, quickSearch, chatSend_default;
  var init_chatSend = __esm({
    "src/plugins/chatSend.js"() {
      init_dom();
      init_style();
      textReplace = {
        id: "textreplace",
        name: "Text Replace",
        description: "Automatically replaces text in your messages before they send. One rule per line: find=>replace.",
        authors: ["yakazt"],
        tags: ["Chat", "Utility"],
        defaultOn: false,
        settings: [
          {
            id: "rules",
            type: "textarea",
            label: "Rules",
            description: "One per line, e.g.  shrug=>¯\\_(ツ)_/¯   or   brb=>be right back",
            default: ""
          }
        ],
        _off: null,
        start(ctx) {
          const rules = (ctx.options().rules || "").split("\n").map((line) => line.split("=>")).filter((p) => p.length === 2 && p[0].trim()).map(([from, to]) => ({ from: from.trim(), to: to.replace(/\\n/g, "\n") }));
          if (!rules.length) return;
          this._off = onComposerSend((text) => {
            let out = text;
            for (const r of rules) {
              out = out.split(r.from).join(r.to);
            }
            return out;
          });
        },
        stop() {
          this._off?.();
          this._off = null;
        }
      };
      TRACKING = /^(utm_|fbclid$|gclid$|mc_|igshid$|ref_?$|si$|spm$|_hsenc$|_hsmi$|vero_)/i;
      urlCleaner = {
        id: "urlcleaner",
        name: "URL Cleaner",
        description: "Strips tracking parameters (utm_, fbclid, igshid…) from links in your messages.",
        authors: ["yakazt"],
        tags: ["Chat", "Privacy"],
        defaultOn: false,
        _off: null,
        start() {
          this._off = onComposerSend(
            (text) => text.replace(/https?:\/\/[^\s]+/g, (match) => {
              try {
                const u = new URL(match);
                const keep = [...u.searchParams.entries()].filter(([k]) => !TRACKING.test(k));
                u.search = "";
                for (const [k, v] of keep) u.searchParams.append(k, v);
                return u.toString();
              } catch {
                return match;
              }
            })
          );
        },
        stop() {
          this._off?.();
          this._off = null;
        }
      };
      quickSearch = {
        id: "quicksearch",
        name: "Quick Search",
        description: "Select text in a message to get a floating button that searches it on the web.",
        authors: ["yakazt"],
        tags: ["Utility"],
        defaultOn: false,
        _btn: null,
        start() {
          setStyle("venper-quicksearch-css", ".vnp-qs{position:fixed;z-index:2147483050;background:var(--bg-float,#1b1c21);border:1px solid var(--border,#ffffff22);color:var(--text,#fff);border-radius:8px;padding:5px 10px;font-size:12px;font-weight:600;cursor:pointer;box-shadow:0 6px 18px #0007;animation:vnp-pop-in .12s ease}.vnp-qs:hover{border-color:var(--accent,#8b7af0)}");
          const remove = () => {
            this._btn?.remove();
            this._btn = null;
          };
          this._onUp = (e) => {
            if (e.target.closest?.(".vnp-qs")) return;
            setTimeout(() => {
              const sel = window.getSelection();
              const text = sel?.toString().trim();
              remove();
              if (!text || text.length < 2 || text.length > 200) return;
              if (!e.target.closest?.(".messages, .msg")) return;
              const rect = sel.getRangeAt(0).getBoundingClientRect();
              const btn = el("div", { class: "vnp-qs" }, "Search “" + (text.length > 24 ? text.slice(0, 24) + "…" : text) + "”");
              btn.style.left = Math.min(innerWidth - 220, rect.left) + "px";
              btn.style.top = rect.top - 36 + "px";
              btn.addEventListener("mousedown", (ev) => {
                ev.preventDefault();
                window.open("https://www.google.com/search?q=" + encodeURIComponent(text), "_blank", "noopener");
                remove();
              });
              document.body.appendChild(btn);
              this._btn = btn;
            }, 10);
          };
          this._onDown = (e) => {
            if (!e.target.closest?.(".vnp-qs")) remove();
          };
          document.addEventListener("mouseup", this._onUp);
          document.addEventListener("mousedown", this._onDown, true);
        },
        stop() {
          document.removeEventListener("mouseup", this._onUp);
          document.removeEventListener("mousedown", this._onDown, true);
          this._btn?.remove();
          this._btn = null;
          setStyle("venper-quicksearch-css", "");
        }
      };
      chatSend_default = [textReplace, urlCleaner, quickSearch];
    }
  });

  // src/plugins/appearance.js
  var compactMode, snowfall, cursorBuddy, customBackground, venperBadge, memberCount, fontLoader, appearance_default;
  var init_appearance = __esm({
    "src/plugins/appearance.js"() {
      init_store();
      init_messages();
      init_dom();
      init_style();
      compactMode = {
        id: "compactmode",
        name: "Compact Mode",
        description: "Tightens message spacing so more fits on screen.",
        authors: ["yakazt"],
        tags: ["Appearance"],
        defaultOn: false,
        start() {
          setStyle(
            "venper-compact-css",
            `.messages .msg{padding-top:1px!important;padding-bottom:1px!important}
       .messages .msg .msg-body{margin:0!important}
       .messages .msg.grouped{margin-top:0!important}
       .messages .day-divider{margin:6px 0!important}`
          );
        },
        stop() {
          setStyle("venper-compact-css", "");
        }
      };
      snowfall = {
        id: "snowfall",
        name: "Snowfall",
        description: "Gentle snow drifting down over Yapper. Purely cosmetic.",
        authors: ["yakazt"],
        tags: ["Fun"],
        defaultOn: false,
        _raf: null,
        _canvas: null,
        start() {
          const canvas = el("canvas", { style: { position: "fixed", inset: "0", pointerEvents: "none", zIndex: "35" } });
          document.body.appendChild(canvas);
          this._canvas = canvas;
          const ctx = canvas.getContext("2d");
          let flakes = [];
          const resize = () => {
            canvas.width = innerWidth;
            canvas.height = innerHeight;
            flakes = Array.from({ length: Math.round(innerWidth * innerHeight / 16e3) }, () => newFlake());
          };
          const newFlake = () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: Math.random() * 2.5 + 1, s: Math.random() * 0.8 + 0.3, d: Math.random() * 0.6 - 0.3 });
          this._resize = resize;
          addEventListener("resize", resize);
          resize();
          const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgba(255,255,255,.8)";
            for (const f of flakes) {
              ctx.beginPath();
              ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
              ctx.fill();
              f.y += f.s;
              f.x += f.d;
              if (f.y > canvas.height) {
                f.y = -5;
                f.x = Math.random() * canvas.width;
              }
            }
            this._raf = requestAnimationFrame(draw);
          };
          draw();
        },
        stop() {
          cancelAnimationFrame(this._raf);
          removeEventListener("resize", this._resize);
          this._canvas?.remove();
          this._canvas = null;
        }
      };
      cursorBuddy = {
        id: "cursorbuddy",
        name: "Cursor Buddy",
        description: "A little star that trails your cursor around. Cosmetic and a bit silly.",
        authors: ["yakazt"],
        tags: ["Fun"],
        defaultOn: false,
        _buddy: null,
        start() {
          const buddy = el("div", { style: { position: "fixed", left: "0", top: "0", width: "16px", height: "16px", pointerEvents: "none", zIndex: "2147482001", transition: "transform .12s ease-out", color: "var(--accent,#8b7af0)" } });
          buddy.append(svg('<path d="M12 2l2.9 6.9L22 9.3l-5 4.6L18.3 21 12 17.3 5.7 21 7 13.9l-5-4.6 7.1-.4z" fill="currentColor" stroke="none"/>', 16));
          document.body.appendChild(buddy);
          this._buddy = buddy;
          let x = innerWidth / 2;
          let y = innerHeight / 2;
          const move = (e) => {
            x = e.clientX + 12;
            y = e.clientY + 12;
            buddy.style.transform = `translate(${x}px, ${y}px)`;
          };
          this._move = move;
          addEventListener("mousemove", move);
        },
        stop() {
          removeEventListener("mousemove", this._move);
          this._buddy?.remove();
          this._buddy = null;
        }
      };
      customBackground = {
        id: "custombackground",
        name: "Custom Background",
        description: "Set a background image behind Yapper, with adjustable opacity.",
        authors: ["yakazt"],
        tags: ["Appearance"],
        defaultOn: false,
        liveReload: false,
        settings: [
          { id: "url", type: "text", label: "Image URL", description: "A direct link to an image (https://…).", default: "" },
          { id: "opacity", type: "slider", label: "Opacity", default: 40, min: 5, max: 100, step: 5, suffix: "%" },
          { id: "blur", type: "slider", label: "Blur", default: 0, min: 0, max: 20, step: 1, suffix: "px" }
        ],
        _ctx: null,
        start(ctx) {
          this._ctx = ctx;
          this._apply();
          this._off = window.__VENPER__?.settings?.onChange(() => this._apply());
        },
        _apply() {
          const o = this._ctx.options();
          if (!o.url) {
            setStyle("venper-custombg-css", "");
            return;
          }
          const url = o.url.replace(/["'\\]/g, "");
          setStyle(
            "venper-custombg-css",
            `.app::before{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;
         background:url("${url}") center/cover no-repeat;opacity:${(o.opacity || 40) / 100};
         filter:blur(${o.blur || 0}px)}
       .app > *{position:relative;z-index:1}
       .rail,.sidebar,.main,.side-panel{background-color:color-mix(in srgb,var(--bg-side) 72%,transparent)!important}`
          );
        },
        stop() {
          this._off?.();
          setStyle("venper-custombg-css", "");
        }
      };
      venperBadge = {
        id: "venperbadge",
        name: "Venper Badge",
        description: "Adds a small local-only Venper badge next to your own name in chat. Only you see it.",
        authors: ["yakazt"],
        tags: ["Appearance", "Fun"],
        defaultOn: false,
        _stop: null,
        start() {
          setStyle(
            "venper-badge-css",
            ".vnp-badge{display:inline-flex;align-items:center;height:15px;padding:0 5px;margin-left:5px;border-radius:5px;background:color-mix(in srgb,var(--accent,#8b7af0) 24%,transparent);color:color-mix(in srgb,var(--accent,#8b7af0) 60%,#fff);font-size:10px;font-weight:700;vertical-align:middle}"
          );
          const mine = myId();
          this._stop = onMessageNode((node, msg) => {
            if (!msg || msg.author_id !== mine) return;
            const head = node.querySelector(".msg-head");
            if (!head || head.querySelector(".vnp-badge")) return;
            head.appendChild(el("span", { class: "vnp-badge", title: "Venper (only visible to you)" }, "Venper"));
          });
        },
        stop() {
          this._stop?.();
          document.querySelectorAll(".vnp-badge").forEach((n) => n.remove());
          setStyle("venper-badge-css", "");
        }
      };
      memberCount = {
        id: "membercount",
        name: "Member Count",
        description: "Shows how many members a server has, and how many are online, above the member list.",
        authors: ["yakazt"],
        tags: ["Appearance", "Utility"],
        defaultOn: false,
        _stop: null,
        _timer: null,
        start() {
          setStyle(
            "venper-membercount-css",
            ".vnp-membercount{display:flex;gap:14px;padding:10px 14px 4px;font-size:12px;font-weight:600;color:var(--text-muted,#9c9daa)}.vnp-membercount b{color:var(--text,#fff)}.vnp-mc-online::before{content:'';display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--success,#3fcf82);margin-right:5px;vertical-align:middle}"
          );
          const paint = () => {
            const panel = document.querySelector(".members-panel .side-panel-body, .side-panel.members-panel .side-panel-body");
            if (!panel) return;
            const sid = activeServerId();
            if (!sid) return;
            const s = state();
            const total = s.memberCounts?.[sid] ?? s.servers?.[sid]?.member_count ?? (s.serverMembers?.[sid]?.length || 0);
            const online = Object.keys(s.online || {}).length;
            let bar = panel.querySelector(".vnp-membercount");
            if (!bar) {
              bar = el("div", { class: "vnp-membercount" });
              panel.insertBefore(bar, panel.firstChild);
            }
            bar.innerHTML = `<span class="vnp-mc-online"><b>${online}</b> online</span><span><b>${total}</b> members</span>`;
          };
          this._timer = setInterval(paint, 1500);
          paint();
        },
        stop() {
          clearInterval(this._timer);
          document.querySelectorAll(".vnp-membercount").forEach((n) => n.remove());
          setStyle("venper-membercount-css", "");
        }
      };
      fontLoader = {
        id: "fontloader",
        name: "Font Loader",
        description: "Use any Google Font across Yapper.",
        authors: ["yakazt"],
        tags: ["Appearance"],
        defaultOn: false,
        liveReload: false,
        settings: [
          { id: "font", type: "text", label: "Google Font name", description: "e.g. Poppins, Nunito, JetBrains Mono.", default: "" }
        ],
        _ctx: null,
        start(ctx) {
          this._ctx = ctx;
          this._apply();
          this._off = window.__VENPER__?.settings?.onChange(() => this._apply());
        },
        _apply() {
          const font = (this._ctx.options().font || "").trim();
          if (!font) {
            setStyle("venper-font-css", "");
            return;
          }
          const family = font.replace(/[^a-zA-Z0-9 ]/g, "");
          const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@400;500;600;700&display=swap`;
          setStyle("venper-font-css", `@import url("${url}");
:root{--font:"${family}",var(--font)!important}body,.app{font-family:"${family}",system-ui,sans-serif!important}`);
        },
        stop() {
          this._off?.();
          setStyle("venper-font-css", "");
        }
      };
      appearance_default = [compactMode, snowfall, cursorBuddy, customBackground, venperBadge, memberCount, fontLoader];
    }
  });

  // src/core/ui/modal.js
  function openModal(title, bodyNode) {
    if (!injected2) {
      setStyle("venper-modal-css", CSS3);
      injected2 = true;
    }
    const overlay2 = el("div", { class: "vnp-modal-overlay vnp-scope" });
    const esc = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close2();
      }
    };
    const close2 = () => {
      document.removeEventListener("keydown", esc, true);
      overlay2.remove();
    };
    overlay2.addEventListener("click", (e) => {
      if (e.target === overlay2) close2();
    });
    document.addEventListener("keydown", esc, true);
    const modal = el(
      "div",
      { class: "vnp-modal" },
      el(
        "div",
        { class: "vnp-modal-head" },
        el("div", { class: "vnp-modal-title" }, title),
        el("button", { class: "vnp-modal-x", "aria-label": "Close", onclick: close2 }, "×")
      ),
      el("div", { class: "vnp-modal-body" }, bodyNode)
    );
    overlay2.appendChild(modal);
    document.body.appendChild(overlay2);
    return close2;
  }
  var CSS3, injected2;
  var init_modal = __esm({
    "src/core/ui/modal.js"() {
      init_dom();
      init_style();
      CSS3 = `
.vnp-modal-overlay { position: fixed; inset: 0; z-index: 2147483100; background: #0008; display: grid; place-items: center; animation: vnp-fade-in .14s ease; }
.vnp-modal { width: min(560px, 92vw); max-height: 80vh; display: flex; flex-direction: column; background: var(--bg-float, var(--bg-elev, #1b1c21)); border: 1px solid var(--border, #ffffff14); border-radius: 14px; box-shadow: 0 20px 60px #000a; animation: vnp-pop-in .18s cubic-bezier(.2,.8,.2,1); overflow: hidden; }
.vnp-modal-head { display: flex; align-items: center; gap: 10px; padding: 16px 18px; border-bottom: 1px solid var(--border, #ffffff10); }
.vnp-modal-title { flex: 1; font-weight: 700; font-size: 16px; color: var(--text, #fff); }
.vnp-modal-x { background: none; border: 0; color: var(--text-faint, #888); cursor: pointer; font-size: 20px; line-height: 1; }
.vnp-modal-x:hover { color: var(--text, #fff); }
.vnp-modal-body { padding: 14px 18px; overflow: auto; }
.vnp-bm-row { display: flex; gap: 12px; align-items: center; padding: 10px 8px; margin: 0 -8px; border-radius: 9px; border-bottom: 1px solid var(--border, #ffffff10); }
.vnp-bm-row:last-child { border-bottom: 0; }
.vnp-bm-main { flex: 1; min-width: 0; }
.vnp-bm-link { cursor: pointer; }
.vnp-bm-row:has(.vnp-bm-link:hover) { background: var(--bg-hover, #ffffff08); }
.vnp-bm-name { font-weight: 650; font-size: 13px; color: var(--text, #fff); }
.vnp-bm-text { font-size: 13.5px; color: var(--text-muted, #b5b6c2); word-break: break-word; margin-top: 2px; }
.vnp-bm-meta { font-size: 11.5px; color: var(--text-faint, #7d7e8a); margin-top: 4px; }
`;
      injected2 = false;
    }
  });

  // src/core/ui/bookmarksModal.js
  var bookmarksModal_exports = {};
  __export(bookmarksModal_exports, {
    normalise: () => normalise,
    open: () => open2
  });
  function normalise(b) {
    const at = typeof b.at === "number" ? b.at : Date.parse(b.at) || null;
    return {
      id: b.id || b.k,
      name: b.name || b.author || (b.author_id ? displayName(b.author_id) : "") || "Unknown",
      content: b.content ?? b.text ?? "",
      channelId: b.channel_id || b.channel || null,
      when: at ? new Date(at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : b.time || ""
    };
  }
  function where(channelId) {
    if (!channelId) return "";
    const ch = channel(channelId);
    if (!ch) return "";
    const srv = ch.server_id ? server(ch.server_id) : null;
    return (srv?.name ? srv.name + " · " : "") + "#" + (ch.name || "channel");
  }
  function open2(list) {
    const body = el("div", { class: "vnp-bm-list" });
    let close2 = () => {
    };
    const empty = () => {
      if (!body.querySelector(".vnp-bm-row")) {
        body.replaceChildren(el("div", { class: "vnp-pnote" }, "No bookmarks yet. Right-click a message and choose Bookmark message."));
      }
    };
    for (const raw3 of list.slice().reverse()) {
      const b = normalise(raw3);
      const meta = [where(b.channelId), b.when].filter(Boolean).join(" · ");
      const main = el(
        "div",
        { class: "vnp-bm-main", title: b.channelId ? "Jump to channel" : "" },
        el("div", { class: "vnp-bm-name" }, b.name),
        el("div", { class: "vnp-bm-text" }, b.content || "(no text)"),
        meta ? el("div", { class: "vnp-bm-meta" }, meta) : null
      );
      if (b.channelId) {
        main.classList.add("vnp-bm-link");
        main.addEventListener("click", () => {
          openChannel(b.channelId);
          close2();
        });
      }
      const del = el(
        "button",
        {
          class: "vnp-btn vnp-small vnp-danger",
          onclick: () => {
            const next = raw2("bookmarks", []).filter((x) => (x.id || x.k) !== b.id);
            setRaw("bookmarks", next);
            row2.remove();
            empty();
          }
        },
        "Remove"
      );
      const row2 = el("div", { class: "vnp-bm-row" }, main, del);
      body.append(row2);
    }
    empty();
    close2 = openModal("Bookmarks", body);
  }
  var init_bookmarksModal = __esm({
    "src/core/ui/bookmarksModal.js"() {
      init_dom();
      init_modal();
      init_actions();
      init_settings();
      init_store();
    }
  });

  // src/plugins/utility.js
  function attachmentUrl(msg) {
    const p = msg?.attachment_path;
    if (!p) return null;
    if (p.startsWith("/")) return "https://www.yapper.website" + p;
    return "https://files.yapper.website/attachments/" + p;
  }
  function isImage(msg) {
    const p = msg?.attachment_path || "";
    return /\.(png|jpe?g|gif|webp|avif|bmp)$/i.test(p) || msg?.attachment_width > 0 && !!p;
  }
  function inlineUnder(messageId, node) {
    const row2 = document.querySelector(`.msg[data-message-id="${String(messageId).replace(/["\\]/g, "\\$&")}"]`);
    const body = row2?.querySelector(".msg-body") || row2;
    if (!body) return;
    body.querySelector(".vnp-inline")?.remove();
    body.appendChild(node);
  }
  async function googleTranslate(text, to = "en") {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    const translated = (data[0] || []).map((seg) => seg[0]).join("");
    const detected = data[2] || "?";
    return { translated, detected };
  }
  var ICON, translate, googleThat, ENGINES, reverseImageSearch, copyImageLink, baseDecoder, unitConverter, imageZoom, mediaSpeed, bookmarks, utility_default;
  var init_utility = __esm({
    "src/plugins/utility.js"() {
      init_contextMenu();
      init_messages();
      init_store();
      init_dom();
      init_style();
      init_toast();
      ICON = {
        translate: '<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>',
        search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
        image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
        copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
        code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
        bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>'
      };
      translate = {
        id: "translate",
        name: "Translate",
        description: "Adds a Translate option to the message menu. When you click it, that message's text is sent to Google Translate.",
        authors: ["yakazt"],
        tags: ["Chat", "Utility"],
        defaultOn: false,
        settings: [
          { id: "to", type: "select", label: "Translate to", default: "en", options: [
            { value: "en", label: "English" },
            { value: "es", label: "Spanish" },
            { value: "pt", label: "Portuguese" },
            { value: "fr", label: "French" },
            { value: "de", label: "German" },
            { value: "it", label: "Italian" },
            { value: "ru", label: "Russian" },
            { value: "ja", label: "Japanese" },
            { value: "ko", label: "Korean" },
            { value: "zh-CN", label: "Chinese" },
            { value: "ar", label: "Arabic" },
            { value: "hi", label: "Hindi" }
          ] }
        ],
        _off: null,
        start(ctx) {
          setStyle("venper-translate-css", ".vnp-inline{margin-top:5px;padding:7px 10px;background:var(--bg-elev,#1e1f22);border-left:2px solid var(--accent,#8b7af0);border-radius:6px;font-size:13px;color:var(--text,#dbdee1)}.vnp-inline .vnp-inline-label{font-size:11px;color:var(--text-faint,#888);margin-bottom:2px}");
          this._off = onMessageMenu((msg, api) => {
            if (!msg.content) return;
            api.item({
              label: "Translate",
              icon: ICON.translate,
              onClick: async () => {
                try {
                  const { translated, detected } = await googleTranslate(msg.content, ctx.options().to);
                  inlineUnder(msg.id, el("div", { class: "vnp-inline" }, el("div", { class: "vnp-inline-label" }, `Translated from ${detected}`), translated));
                } catch {
                  toast("Translate failed", "Couldn't reach the translation service.", { color: colors.danger, important: true });
                }
              }
            });
          });
        },
        stop() {
          this._off?.();
          document.querySelectorAll(".vnp-inline").forEach((n) => n.remove());
          setStyle("venper-translate-css", "");
        }
      };
      googleThat = {
        id: "googlethat",
        name: "Google That",
        description: "Adds a 'Search with Google' option to the message menu.",
        authors: ["yakazt"],
        tags: ["Utility"],
        defaultOn: false,
        _off: null,
        start() {
          this._off = onMessageMenu((msg, api) => {
            if (!msg.content) return;
            api.item({
              label: "Search with Google",
              icon: ICON.search,
              onClick: () => window.open("https://www.google.com/search?q=" + encodeURIComponent(msg.content), "_blank", "noopener")
            });
          });
        },
        stop() {
          this._off?.();
        }
      };
      ENGINES = [
        { name: "Google Lens", make: (u) => "https://lens.google.com/uploadbyurl?url=" + encodeURIComponent(u) },
        { name: "Yandex", make: (u) => "https://yandex.com/images/search?rpt=imageview&url=" + encodeURIComponent(u) },
        { name: "SauceNAO", make: (u) => "https://saucenao.com/search.php?url=" + encodeURIComponent(u) },
        { name: "TinEye", make: (u) => "https://tineye.com/search?url=" + encodeURIComponent(u) }
      ];
      reverseImageSearch = {
        id: "reverseimagesearch",
        name: "Reverse Image Search",
        description: "Adds reverse-image-search options for image attachments to the message menu.",
        authors: ["yakazt"],
        tags: ["Utility"],
        defaultOn: false,
        _off: null,
        start() {
          this._off = onMessageMenu((msg, api) => {
            if (!isImage(msg)) return;
            const url = attachmentUrl(msg);
            if (!url) return;
            for (const e of ENGINES) {
              api.item({ label: "Search image: " + e.name, icon: ICON.image, onClick: () => window.open(e.make(url), "_blank", "noopener") });
            }
          });
        },
        stop() {
          this._off?.();
        }
      };
      copyImageLink = {
        id: "copyimagelink",
        name: "Copy Image Link",
        description: "Adds 'Copy image link' for image attachments to the message menu.",
        authors: ["yakazt"],
        tags: ["Utility"],
        defaultOn: false,
        _off: null,
        start() {
          this._off = onMessageMenu((msg, api) => {
            if (!isImage(msg)) return;
            const url = attachmentUrl(msg);
            if (!url) return;
            api.item({
              label: "Copy image link",
              icon: ICON.copy,
              onClick: () => {
                navigator.clipboard?.writeText(url).then(
                  () => toast("Copied", "Image link copied.", { color: colors.success, timeout: 2500 }),
                  () => {
                  }
                );
              }
            });
          });
        },
        stop() {
          this._off?.();
        }
      };
      baseDecoder = {
        id: "basedecoder",
        name: "Base64 Decoder",
        description: "Adds 'Decode Base64' to the message menu when a message looks encoded.",
        authors: ["yakazt"],
        tags: ["Utility"],
        defaultOn: false,
        _off: null,
        start() {
          this._off = onMessageMenu((msg, api) => {
            const t = (msg.content || "").trim();
            if (t.length < 8 || t.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(t)) return;
            api.item({
              label: "Decode Base64",
              icon: ICON.code,
              onClick: () => {
                try {
                  const decoded = decodeURIComponent(escape(atob(t)));
                  inlineUnder(msg.id, el("div", { class: "vnp-inline" }, el("div", { class: "vnp-inline-label" }, "Decoded"), decoded));
                } catch {
                  toast("Decode failed", "That isn't valid Base64.", { color: colors.danger });
                }
              }
            });
          });
        },
        stop() {
          this._off?.();
          document.querySelectorAll(".vnp-inline").forEach((n) => n.remove());
        }
      };
      unitConverter = {
        id: "unitconverter",
        name: "Unit Converter",
        description: "Shows metric/imperial conversions for temperatures, distances and weights in messages.",
        authors: ["yakazt"],
        tags: ["Utility"],
        defaultOn: false,
        _stop: null,
        start() {
          setStyle("venper-unit-css", ".vnp-unit{font-size:11px;color:var(--text-faint,#888);margin-left:5px;background:var(--bg-elev,#1e1f22);border-radius:4px;padding:0 5px}");
          const convs = [
            { re: /(-?\d+(?:\.\d+)?)\s*°?\s*F\b/gi, f: (n) => `${((n - 32) * 5 / 9).toFixed(1)}°C` },
            { re: /(-?\d+(?:\.\d+)?)\s*°?\s*C\b/gi, f: (n) => `${(n * 9 / 5 + 32).toFixed(1)}°F` },
            { re: /(\d+(?:\.\d+)?)\s*mi(?:les?)?\b/gi, f: (n) => `${(n * 1.609).toFixed(1)} km` },
            { re: /(\d+(?:\.\d+)?)\s*km\b/gi, f: (n) => `${(n / 1.609).toFixed(1)} mi` },
            { re: /(\d+(?:\.\d+)?)\s*lbs?\b/gi, f: (n) => `${(n * 0.4536).toFixed(1)} kg` },
            { re: /(\d+(?:\.\d+)?)\s*kg\b/gi, f: (n) => `${(n / 0.4536).toFixed(1)} lb` }
          ];
          this._stop = onMessageNode((node, msg) => {
            if (!msg?.content) return;
            const textEl = node.querySelector(".msg-text");
            if (!textEl || textEl.querySelector(".vnp-unit")) return;
            for (const c of convs) {
              c.re.lastIndex = 0;
              const m = c.re.exec(msg.content);
              if (m) {
                textEl.appendChild(el("span", { class: "vnp-unit", title: "Venper unit conversion" }, "≈ " + c.f(parseFloat(m[1]))));
                break;
              }
            }
          });
        },
        stop() {
          this._stop?.();
          document.querySelectorAll(".vnp-unit").forEach((n) => n.remove());
          setStyle("venper-unit-css", "");
        }
      };
      imageZoom = {
        id: "imagezoom",
        name: "Image Zoom",
        description: "Scroll to zoom when an image is open in the viewer.",
        authors: ["yakazt"],
        tags: ["Utility"],
        defaultOn: false,
        _handler: null,
        start() {
          this._handler = (e) => {
            const img = e.target.closest?.(".lightbox img, .lightbox-open img");
            if (!img) return;
            e.preventDefault();
            const cur = Number(img.dataset.vnpZoom || 1);
            const next = Math.min(6, Math.max(1, cur + (e.deltaY < 0 ? 0.2 : -0.2)));
            img.dataset.vnpZoom = next;
            img.style.transform = `scale(${next})`;
            img.style.transition = "transform .08s";
          };
          document.addEventListener("wheel", this._handler, { passive: false, capture: true });
        },
        stop() {
          if (this._handler) document.removeEventListener("wheel", this._handler, true);
          document.querySelectorAll("[data-vnp-zoom]").forEach((n) => {
            n.style.transform = "";
            delete n.dataset.vnpZoom;
          });
        }
      };
      mediaSpeed = {
        id: "mediaplaybackspeed",
        name: "Media Playback Speed",
        description: "Adds a speed control to videos and voice messages.",
        authors: ["yakazt"],
        tags: ["Utility"],
        defaultOn: false,
        _stop: null,
        start() {
          setStyle("venper-speed-css", ".vnp-speed{position:absolute;top:6px;right:6px;z-index:5;background:#000a;color:#fff;border:0;border-radius:6px;font-size:11px;font-weight:700;padding:2px 6px;cursor:pointer}");
          const speeds = [1, 1.25, 1.5, 2, 0.5, 0.75];
          this._stop = observe("video, audio", (media) => {
            const host2 = media.closest(".msg-video-box, .voice-msg, .msg-body") || media.parentElement;
            if (!host2 || host2.querySelector(".vnp-speed")) return;
            if (getComputedStyle(host2).position === "static") host2.style.position = "relative";
            let i = 0;
            const btn = el("button", { class: "vnp-speed" }, "1×");
            btn.addEventListener("click", (e) => {
              e.stopPropagation();
              i = (i + 1) % speeds.length;
              media.playbackRate = speeds[i];
              btn.textContent = speeds[i] + "×";
            });
            host2.appendChild(btn);
          });
        },
        stop() {
          this._stop?.();
          document.querySelectorAll(".vnp-speed").forEach((n) => n.remove());
          setStyle("venper-speed-css", "");
        }
      };
      bookmarks = {
        id: "bookmarks",
        name: "Bookmarks",
        description: "Save messages to a private local list, from the message menu.",
        authors: ["yakazt"],
        tags: ["Utility"],
        defaultOn: false,
        _off: null,
        start() {
          const S = window.__VENPER__.settings;
          this._off = onMessageMenu((msg, api) => {
            api.item({
              label: "Bookmark message",
              icon: ICON.bookmark,
              onClick: () => {
                const list = S.raw("bookmarks", []);
                if (list.find((b) => b.id === msg.id)) {
                  toast("Already bookmarked", "", { timeout: 2e3 });
                  return;
                }
                list.push({ id: msg.id, content: msg.content, author_id: msg.author_id, channel_id: msg.channel_id, at: Date.now(), name: displayName(msg.author_id) });
                S.setRaw("bookmarks", list.slice(-500));
                toast("Bookmarked", "Saved to your bookmarks.", { color: colors.success, timeout: 2500 });
              }
            });
          });
        },
        stop() {
          this._off?.();
        },
        commands: [
          {
            id: "view-bookmarks",
            name: "View bookmarks",
            description: "Show your saved messages",
            run: () => {
              const list = window.__VENPER__.settings.raw("bookmarks", []);
              if (!list.length) return toast("No bookmarks", "Bookmark a message from its right-click menu.", { timeout: 3e3 });
              Promise.resolve().then(() => (init_bookmarksModal(), bookmarksModal_exports)).then((m) => m.open(list));
            }
          }
        ]
      };
      utility_default = [translate, googleThat, reverseImageSearch, copyImageLink, baseDecoder, unitConverter, imageZoom, mediaSpeed, bookmarks];
    }
  });

  // src/plugins/extras.js
  function attachmentUrl2(msg) {
    const p = msg?.attachment_path;
    if (!p) return null;
    return p.startsWith("/") ? "https://www.yapper.website" + p : "https://files.yapper.website/attachments/" + p;
  }
  function triggerDownload(url, name) {
    const a = el("a", { href: url, download: name || "", target: "_blank", rel: "noopener" });
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  var downloadAll, exportMessages, markAllRead, keyboardSounds, callTimer, extras_default;
  var init_extras = __esm({
    "src/plugins/extras.js"() {
      init_store();
      init_actions();
      init_dom();
      init_style();
      init_toast();
      downloadAll = {
        id: "downloadallattachments",
        name: "Download All Attachments",
        description: "Downloads every attachment currently loaded in the open channel.",
        authors: ["yakazt"],
        tags: ["Utility"],
        defaultOn: false,
        commands: [
          {
            id: "download-all-attachments",
            name: "Download all attachments here",
            description: "Save every attachment loaded in this channel",
            run: () => {
              const cid = activeChannelId();
              const msgs = messagesIn(cid).filter((m) => m.attachment_path);
              if (!msgs.length) return toast("Nothing to download", "No attachments are loaded in this channel.", { timeout: 3e3 });
              msgs.forEach(
                (m, i) => setTimeout(() => triggerDownload(attachmentUrl2(m), m.attachment_name || ""), i * 350)
              );
              toast("Downloading", `${msgs.length} attachment(s).`, { color: colors.success });
            }
          }
        ],
        start() {
        },
        stop() {
        }
      };
      exportMessages = {
        id: "exportmessages",
        name: "Export Messages",
        description: "Exports the messages loaded in the open channel to a JSON file.",
        authors: ["yakazt"],
        tags: ["Utility"],
        defaultOn: false,
        commands: [
          {
            id: "export-channel",
            name: "Export this channel's messages",
            description: "Download loaded messages as JSON",
            run: () => {
              const cid = activeChannelId();
              if (!cid) return;
              const ch = channel(cid);
              const msgs = messagesIn(cid).map((m) => ({
                author: displayName(m.author_id),
                author_id: m.author_id,
                content: m.content,
                at: m.created_at,
                edited: m.edited_at,
                attachment: m.attachment_path || null
              }));
              const blob = new Blob([JSON.stringify({ channel: ch?.name, exported: (/* @__PURE__ */ new Date()).toISOString(), messages: msgs }, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              triggerDownload(url, `${ch?.name || "channel"}-export.json`);
              setTimeout(() => URL.revokeObjectURL(url), 2e3);
              toast("Exported", `${msgs.length} message(s).`, { color: colors.success });
            }
          }
        ],
        start() {
        },
        stop() {
        }
      };
      markAllRead = {
        id: "markallread",
        name: "Mark Server Read",
        description: "Adds a command to mark the whole current server as read.",
        authors: ["yakazt"],
        tags: ["Utility"],
        defaultOn: false,
        commands: [
          {
            id: "mark-server-read",
            name: "Mark this server as read",
            description: "Clear unread marks for the current server",
            run: () => {
              const sid = activeServerId();
              const fn = raw("markServerRead");
              if (sid && fn) {
                fn(sid);
                toast("Marked as read", "", { timeout: 2e3 });
              } else {
                toast("Not available", "Open a server first.", { timeout: 2500 });
              }
            }
          }
        ],
        start() {
        },
        stop() {
        }
      };
      keyboardSounds = {
        id: "keyboardsounds",
        name: "Keyboard Sounds",
        description: "Plays a soft click as you type in the message box.",
        authors: ["yakazt"],
        tags: ["Fun"],
        defaultOn: false,
        settings: [{ id: "volume", type: "slider", label: "Volume", default: 30, min: 5, max: 100, step: 5, suffix: "%" }],
        _handler: null,
        _actx: null,
        start(ctx) {
          const vol = (ctx.options().volume || 30) / 100;
          this._handler = (e) => {
            if (!e.target.closest?.(".composer")) return;
            if (e.key.length !== 1 && e.key !== "Backspace" && e.key !== "Enter") return;
            try {
              if (!this._actx) this._actx = new (window.AudioContext || window.webkitAudioContext)();
              const a = this._actx;
              const osc = a.createOscillator();
              const gain = a.createGain();
              osc.type = "square";
              osc.frequency.value = e.key === "Enter" ? 320 : 180 + Math.random() * 60;
              gain.gain.value = vol * 0.04;
              osc.connect(gain).connect(a.destination);
              osc.start();
              gain.gain.exponentialRampToValueAtTime(1e-4, a.currentTime + 0.06);
              osc.stop(a.currentTime + 0.07);
            } catch {
            }
          };
          document.addEventListener("keydown", this._handler, true);
        },
        stop() {
          if (this._handler) document.removeEventListener("keydown", this._handler, true);
          try {
            this._actx?.close();
          } catch {
          }
          this._actx = null;
        }
      };
      callTimer = {
        id: "calltimer",
        name: "Call Timer",
        description: "Shows how long you've been in the current voice call.",
        authors: ["yakazt"],
        tags: ["Utility"],
        defaultOn: false,
        _timer: null,
        _since: 0,
        start() {
          setStyle("venper-calltimer-css", ".vnp-calltimer{font-variant-numeric:tabular-nums;font-weight:700;color:var(--success,#3fcf82);margin-left:8px;font-size:12px}");
          this._timer = setInterval(() => {
            const bar = document.querySelector(".voice-bar .voice-bar-info, .voice-bar");
            if (!bar) {
              this._since = 0;
              return;
            }
            if (!this._since) this._since = Date.now();
            let badge = bar.querySelector(".vnp-calltimer");
            if (!badge) {
              badge = el("span", { class: "vnp-calltimer" });
              bar.appendChild(badge);
            }
            const secs = Math.floor((Date.now() - this._since) / 1e3);
            const mm = String(Math.floor(secs / 60)).padStart(2, "0");
            const ss = String(secs % 60).padStart(2, "0");
            badge.textContent = `${mm}:${ss}`;
          }, 1e3);
        },
        stop() {
          clearInterval(this._timer);
          document.querySelectorAll(".vnp-calltimer").forEach((n) => n.remove());
          setStyle("venper-calltimer-css", "");
        }
      };
      extras_default = [downloadAll, exportMessages, markAllRead, keyboardSounds, callTimer];
    }
  });

  // src/core/ui/panelStyle.js
  var PANEL_CSS;
  var init_panelStyle = __esm({
    "src/core/ui/panelStyle.js"() {
      PANEL_CSS = String.raw`
/* ---- comfy settings window: bigger and calmer, the way the user likes it ---- */
/* Scoped to Yapper's own settings modal; scale is user-adjustable. */
.overlay .modal.wide.vnp-comfy {
  width: min(calc(1040px * var(--vnp-settings-scale, 1)), 94vw) !important;
  max-width: 94vw !important;
  height: min(calc(760px * var(--vnp-settings-scale, 1)), 92vh) !important;
  max-height: 92vh !important;
  animation: vnp-settings-in .22s cubic-bezier(.2,.8,.2,1);
}
.overlay .modal.wide.vnp-comfy .settings { height: 100%; }
.overlay .modal.wide.vnp-comfy .settings-nav { padding-top: 14px; }
.overlay .modal.wide.vnp-comfy .settings-main { padding: 8px 4px; }
@keyframes vnp-settings-in { from { opacity: 0; transform: scale(.985) translateY(6px) } to { opacity: 1; transform: none } }

/* ---- Venper nav section inside Yapper's settings sidebar ---- */
.vnp-nav-label {
  font-size: 11px; text-transform: uppercase; letter-spacing: .06em;
  color: var(--text-faint, #6e6f7b); font-weight: 700; padding: 16px 10px 6px;
  display: flex; align-items: center; gap: 6px;
}
.vnp-nav-label .vnp-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--vnp); }
.vnp-navbtn {
  display: flex; align-items: center; gap: 9px; width: 100%; text-align: left;
  padding: 7px 10px; border-radius: 6px; border: 0; background: transparent;
  color: var(--text-muted, #b5bac1); font: 500 14px var(--font, "Inter", sans-serif);
  cursor: pointer; margin: 1px 0; transition: background .12s, color .12s;
}
.vnp-navbtn:hover { background: var(--bg-hover, #2b2d31); color: var(--text, #fff); }
.vnp-navbtn.vnp-active { background: var(--bg-active, #35373c); color: var(--text, #fff); }
.vnp-navbtn svg { flex: none; opacity: .9; }

/* ---- the panel body ---- */
#venper-panel {
  padding: 24px 34px 60px; color: var(--text, #dbdee1); line-height: 1.5;
  max-width: 920px; animation: vnp-rise .26s cubic-bezier(.2,.8,.2,1);
}
#venper-panel h2 { margin: 0 0 2px; font-size: 22px; color: var(--text, #fff); font-weight: 750; }
#venper-panel .vnp-head-sub { color: var(--text-muted, #9c9daa); font-size: 13.5px; margin: 0 0 8px; }
.vnp-sec { margin: 24px 0 8px; }
.vnp-sec-title { font-size: 15px; color: var(--text, #fff); margin: 0; font-weight: 650; }
.vnp-sec-sub { font-size: 12.5px; color: var(--text-muted, #9c9daa); margin: 2px 0 0; }
.vnp-row { display: flex; align-items: center; gap: 14px; padding: 11px 0; border-bottom: 1px solid var(--border, #ffffff10); }
.vnp-row:last-child { border-bottom: 0; }
.vnp-row-text { flex: 1; min-width: 0; }
.vnp-row-title { font-weight: 600; color: var(--text, #fff); font-size: 14px; }
.vnp-row-desc { font-size: 12.5px; color: var(--text-muted, #9c9daa); margin-top: 2px; }
.vnp-card { background: var(--bg-elev, #1e1f22); border: 1px solid var(--border, #2b2d31); border-radius: 12px; padding: 14px 16px; margin: 12px 0; }
.vnp-input, .vnp-select, .vnp-area {
  background: var(--bg-input, #111214); border: 1px solid var(--border, #3f4147);
  color: var(--text, #dbdee1); border-radius: 8px; padding: 8px 10px;
  font: 13px var(--font, "Inter", sans-serif); outline: none; width: 100%; box-sizing: border-box;
  transition: border-color .12s;
}
.vnp-input:focus, .vnp-select:focus, .vnp-area:focus { border-color: var(--vnp); }
.vnp-area { font: 12.5px/1.5 ui-monospace, Consolas, monospace; min-height: 150px; resize: vertical; }
.vnp-select { cursor: pointer; }
.vnp-slider-wrap { display: flex; align-items: center; gap: 10px; min-width: 180px; }
.vnp-slider { flex: 1; accent-color: var(--vnp); }
.vnp-slider-val { font-size: 12.5px; color: var(--text-muted, #9c9daa); min-width: 42px; text-align: right; }
.vnp-pnote { border: 1px solid var(--border, #3f4147); border-left: 3px solid var(--vnp); background: var(--bg-elev, #1e1f22); border-radius: 8px; padding: 11px 14px; font-size: 12.5px; color: var(--text-muted, #b5bac1); margin: 12px 0; }
.vnp-pnote a { color: color-mix(in srgb, var(--vnp) 60%, #fff); }
.vnp-warn { border-left-color: var(--warning, #f0b648); }

/* ---- stat strip ---- */
.vnp-stats { display: flex; background: var(--bg-elev, #1e1f22); border: 1px solid var(--border, #2b2d31); border-radius: 12px; margin: 14px 0; overflow: hidden; }
.vnp-stat { flex: 1; padding: 13px 10px; text-align: center; border-left: 1px solid var(--border, #2b2d31); }
.vnp-stat:first-child { border-left: 0; }
.vnp-stat b { display: block; font-size: 22px; color: var(--text, #fff); font-weight: 700; }
.vnp-stat span { font-size: 11.5px; color: var(--text-muted, #9c9daa); }

/* ---- plugin grid ---- */
.vnp-ptools { display: flex; gap: 10px; align-items: center; margin: 12px 0; flex-wrap: wrap; }
.vnp-ptools .vnp-input { flex: 1; min-width: 160px; }
.vnp-pgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8px; }
@media (max-width: 920px) { .vnp-pgrid { grid-template-columns: 1fr; } }
.vnp-pcard { background: var(--bg-elev, #1e1f22); border: 1px solid var(--border, #2b2d31); border-radius: 11px; padding: 13px 15px; min-width: 0; transition: border-color .14s, transform .08s, opacity .14s; animation: vnp-pop-in .2s ease; }
.vnp-pcard:hover { border-color: color-mix(in srgb, var(--vnp) 50%, var(--border, #2b2d31)); }
.vnp-pcard.vnp-off { opacity: .62; }
.vnp-phead { display: flex; align-items: center; gap: 9px; }
.vnp-pname { flex: 1; min-width: 0; font-weight: 700; color: var(--text, #fff); font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vnp-pauthor { font-size: 11.5px; color: var(--text-muted, #9c9daa); font-weight: 400; }
.vnp-pdesc { font-size: 12.5px; color: var(--text-muted, #9c9daa); margin-top: 6px; line-height: 1.45; }
.vnp-pbased { font-size: 11px; color: var(--text-faint, #7d7e8a); margin-top: 6px; }
.vnp-ptags { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 9px; }
.vnp-tag { font-size: 10.5px; font-weight: 600; color: var(--text-muted, #9c9daa); background: var(--bg-active, #2b2d31); border-radius: 5px; padding: 1px 7px; }
.vnp-cog { background: transparent; border: 0; color: var(--text-muted, #b5bac1); border-radius: 6px; padding: 5px; cursor: pointer; display: inline-flex; transition: background .12s, color .12s; }
.vnp-cog:hover { background: var(--bg-active, #2b2d31); color: var(--text, #fff); }
.vnp-pcard-settings { margin-top: 11px; padding-top: 11px; border-top: 1px solid var(--border, #2b2d31); animation: vnp-rise .18s ease; }
.vnp-btnrow { display: flex; gap: 9px; flex-wrap: wrap; margin: 12px 0; }
.vnp-theme-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; margin: 12px 0; }
.vnp-theme { border: 1px solid var(--border, #3f4147); border-radius: 11px; padding: 10px; cursor: pointer; background: var(--bg-elev, #1e1f22); text-align: left; color: var(--text, #fff); font: 600 13px var(--font, "Inter", sans-serif); transition: outline .12s; }
.vnp-theme.vnp-active { outline: 2px solid var(--vnp); }
.vnp-theme .vnp-sw { display: flex; height: 26px; border-radius: 6px; overflow: hidden; margin-bottom: 7px; }
.vnp-theme .vnp-sw div { flex: 1; }
.vnp-changelog-v { font-weight: 700; color: var(--vnp); margin: 16px 0 4px; font-size: 13px; }
.vnp-changelog-list { margin: 0 0 4px; padding-left: 18px; font-size: 13px; color: var(--text-muted, #b5bac1); }
.vnp-changelog-list li { margin: 3px 0; }
#venper-panel h2 .vnp-ver-chip { display: inline-block; background: color-mix(in srgb, var(--vnp) 24%, transparent); color: color-mix(in srgb, var(--vnp) 55%, #fff); border-radius: 7px; padding: 1px 9px; font-size: 12px; font-weight: 700; margin-left: 10px; vertical-align: middle; }
.vnp-credit { color: var(--text-faint, #6e6f7b); font-size: 12px; margin-top: 26px; }
#venper-panel code { background: var(--bg-input, #111214); border-radius: 4px; padding: 1px 5px; font-size: 12px; }
`;
    }
  });

  // src/core/ui/tabs/plugins.js
  function ICON2(path) {
    return path;
  }
  function renderPlugins(root, { refresh }) {
    root.append(el("h2", {}, "Plugins"));
    root.append(
      el("p", { class: "vnp-head-sub" }, "Toggle features on and off. Each plugin runs locally in your browser.")
    );
    const list = all().slice().sort((a, b) => a.name.localeCompare(b.name));
    const stats2 = stats();
    const strip = el("div", { class: "vnp-stats" });
    strip.append(stat(stats2.enabled, "Enabled"));
    strip.append(stat(stats2.total, "Total"));
    strip.append(stat(allTags(list).length, "Categories"));
    root.append(strip);
    const tools = el("div", { class: "vnp-ptools" });
    const search = textInput(filter.query, "Search plugins…", (v) => {
      filter.query = v;
      paint();
    });
    const stateSel = dropdown(
      filter.state,
      [
        { value: "all", label: "All" },
        { value: "on", label: "Enabled" },
        { value: "off", label: "Disabled" }
      ],
      (v) => {
        filter.state = v;
        paint();
      }
    );
    stateSel.style.maxWidth = "130px";
    const tagSel = dropdown(
      filter.tag,
      [{ value: "all", label: "All categories" }, ...allTags(list).map((t) => ({ value: t, label: t }))],
      (v) => {
        filter.tag = v;
        paint();
      }
    );
    tagSel.style.maxWidth = "170px";
    tools.append(search, stateSel, tagSel);
    root.append(tools);
    const grid = el("div", { class: "vnp-pgrid" });
    root.append(grid);
    function paint() {
      grid.innerHTML = "";
      const q = filter.query.trim().toLowerCase();
      const shown = list.filter((p) => {
        if (filter.state === "on" && !p.enabled) return false;
        if (filter.state === "off" && p.enabled) return false;
        if (filter.tag !== "all" && !(p.tags || []).includes(filter.tag)) return false;
        if (q) {
          const hay = (p.name + " " + (p.description || "") + " " + (p.tags || []).join(" ")).toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });
      if (!shown.length) {
        grid.append(el("div", { class: "vnp-pnote" }, "No plugins match that filter."));
        return;
      }
      for (const p of shown) grid.append(pluginCard(p, refresh));
    }
    paint();
  }
  function allTags(list) {
    const set = /* @__PURE__ */ new Set();
    for (const p of list) for (const t of p.tags || []) set.add(t);
    return [...set].sort();
  }
  function pluginCard(plugin, refresh) {
    const card = el("div", { class: "vnp-pcard" + (plugin.enabled ? "" : " vnp-off") });
    const head = el("div", { class: "vnp-phead" });
    const name = el(
      "div",
      { class: "vnp-pname" },
      plugin.name,
      plugin.authors?.length ? el("span", { class: "vnp-pauthor" }, "  by " + plugin.authors.join(", ")) : null
    );
    head.append(name);
    const hasSettings = (plugin.settings || []).length > 0;
    let settingsOpen = false;
    let settingsBox = null;
    if (hasSettings) {
      const cog = el("button", { class: "vnp-cog", title: "Settings", "aria-label": "Plugin settings" }, svg(COG, 16));
      cog.addEventListener("click", () => {
        settingsOpen = !settingsOpen;
        if (settingsOpen) {
          settingsBox = pluginSettings(plugin);
          card.appendChild(settingsBox);
        } else {
          settingsBox?.remove();
          settingsBox = null;
        }
      });
      head.append(cog);
    }
    const sw = switchEl(plugin.enabled, (on) => {
      setEnabled(plugin.id, on);
      card.classList.toggle("vnp-off", !on);
    });
    head.append(sw);
    card.append(head);
    card.append(el("div", { class: "vnp-pdesc" }, plugin.description || ""));
    if (plugin.basedOn) {
      const b = plugin.basedOn;
      card.append(
        el(
          "div",
          { class: "vnp-pbased" },
          `Based on ${b.name} from ${b.from}` + (b.authors?.length ? ` by ${b.authors.join(", ")}` : "")
        )
      );
    }
    if (plugin.tags?.length) {
      const tags = el("div", { class: "vnp-ptags" });
      for (const t of plugin.tags) tags.append(el("span", { class: "vnp-tag" }, t));
      card.append(tags);
    }
    return card;
  }
  function pluginSettings(plugin) {
    const box = el("div", { class: "vnp-pcard-settings" });
    const opts = pluginOptions(plugin);
    for (const def of plugin.settings) {
      const value = opts[def.id];
      let control;
      switch (def.type) {
        case "toggle":
          control = switchEl(!!value, (v) => {
            setPluginOption(plugin.id, def.id, v);
            after(plugin);
          });
          break;
        case "select":
          control = dropdown(value, def.options || [], (v) => {
            setPluginOption(plugin.id, def.id, v);
            after(plugin);
          });
          control.style.maxWidth = "200px";
          break;
        case "slider":
          control = slider(
            Number(value),
            { min: def.min ?? 0, max: def.max ?? 100, step: def.step ?? 1, suffix: def.suffix || "" },
            (v) => {
              setPluginOption(plugin.id, def.id, v);
              after(plugin);
            }
          );
          break;
        case "textarea":
          control = textInput(value, def.placeholder, (v) => {
            setPluginOption(plugin.id, def.id, v);
            after(plugin);
          }, { area: true });
          break;
        default:
          control = textInput(value, def.placeholder, (v) => {
            setPluginOption(plugin.id, def.id, v);
            after(plugin);
          });
      }
      if (def.type === "textarea") {
        box.append(sectionTitle(def.label, def.description), control);
      } else {
        box.append(row(def.label, def.description, control));
      }
    }
    return box;
  }
  function after(plugin) {
    if (plugin.enabled && plugin.liveReload !== false) restart(plugin.id);
  }
  var COG, filter;
  var init_plugins2 = __esm({
    "src/core/ui/tabs/plugins.js"() {
      init_dom();
      init_plugins();
      init_settings();
      init_panelWidgets();
      COG = ICON2('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>');
      filter = { query: "", state: "all", tag: "all" };
    }
  });

  // src/core/ui/tabs/themes.js
  function renderThemes(root) {
    root.append(el("h2", {}, "Themes"));
    root.append(el("p", { class: "vnp-head-sub" }, "Recolour Yapper and add your own CSS. Applies on top of the current theme."));
    root.append(sectionTitle("Accent colour", "Changes Venper and Yapper's highlight colour everywhere."));
    const grid = el("div", { class: "vnp-theme-grid" });
    const active = getAccent();
    for (const preset of ACCENT_PRESETS) {
      const swatch = el("div", { class: "vnp-sw" });
      const c = preset.color || "var(--accent, #8b7af0)";
      swatch.append(el("div", { style: { background: c } }), el("div", { style: { background: "var(--bg-side, #1b1c21)" } }), el("div", { style: { background: "var(--bg-main, #222)" } }));
      const btn = el("button", { class: "vnp-theme" + (preset.id === active ? " vnp-active" : "") }, swatch, preset.label);
      btn.addEventListener("click", () => {
        setAccent(preset.id);
        grid.querySelectorAll(".vnp-theme").forEach((b) => b.classList.remove("vnp-active"));
        btn.classList.add("vnp-active");
      });
      grid.append(btn);
    }
    root.append(grid);
    root.append(sectionTitle("Custom CSS (QuickCSS)", "Any CSS here is applied live. Great for small tweaks and full themes."));
    const area = textInput(
      getQuickCss(),
      "/* e.g. */\n.msg:hover { background: var(--bg-hover); }",
      (v) => setQuickCss(v),
      { area: true }
    );
    area.style.minHeight = "260px";
    root.append(area);
    root.append(
      note(
        "Paste a theme’s CSS here, or write your own. Changes save and apply as you type. Target Yapper’s classes like <code>.msg</code>, <code>.rail</code>, <code>.composer</code>."
      )
    );
  }
  var init_themes2 = __esm({
    "src/core/ui/tabs/themes.js"() {
      init_dom();
      init_themes();
      init_panelWidgets();
    }
  });

  // src/core/ui/tabs/backup.js
  function download(name, text) {
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = el("a", { href: url, download: name });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2e3);
  }
  function pickFile() {
    return new Promise((resolve) => {
      const input = el("input", { type: "file", accept: "application/json,.json" });
      input.style.display = "none";
      input.addEventListener("change", () => {
        const file = input.files?.[0];
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsText(file);
      });
      document.body.appendChild(input);
      input.click();
      input.remove();
    });
  }
  function importWith(opts, label) {
    pickFile().then((text) => {
      if (!text) return;
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        toast("Import failed", "That file isn't a valid Venper backup.", { color: colors.danger, important: true });
        return;
      }
      importAll(data, opts);
      toast("Imported", `${label} restored. Reload Yapper to apply everything.`, { color: colors.success });
    });
  }
  function renderBackup(root) {
    root.append(el("h2", {}, "Backup & Restore"));
    root.append(el("p", { class: "vnp-head-sub" }, "Move your Venper setup between devices, or keep a copy. Backups are plain JSON and stay on your computer."));
    root.append(sectionTitle("Export"));
    const exportRow = el("div", { class: "vnp-btnrow" });
    exportRow.append(
      button("Export everything", "primary", () => {
        const stamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
        download(`venper-backup-${stamp}.json`, JSON.stringify(exportAll(), null, 2));
        toast("Exported", "Your Venper backup was downloaded.", { color: colors.success });
      })
    );
    root.append(exportRow);
    root.append(sectionTitle("Import", "Pick which parts of a backup to restore."));
    const importRow = el("div", { class: "vnp-btnrow" });
    importRow.append(button("Import everything", null, () => importWith({ plugins: true, themes: true, prefs: true }, "Everything")));
    importRow.append(button("Import plugins only", null, () => importWith({ plugins: true, themes: false, prefs: false }, "Plugins")));
    importRow.append(button("Import themes only", null, () => importWith({ plugins: false, themes: true, prefs: false }, "Themes")));
    root.append(importRow);
    root.append(note("Importing overwrites your matching Venper settings. It never touches your Yapper account."));
  }
  var init_backup = __esm({
    "src/core/ui/tabs/backup.js"() {
      init_dom();
      init_settings();
      init_toast();
      init_panelWidgets();
    }
  });

  // src/core/ui/tabs/about.js
  function renderAbout(root) {
    root.append(el("h2", {}, el("span", {}, "Venper"), el("span", { class: "vnp-ver-chip" }, "v" + VERSION)));
    root.append(el("p", { class: "vnp-head-sub" }, "An open-source client mod for Yapper: plugins, themes and quality-of-life, all running locally."));
    const stats2 = stats();
    const strip = el("div", { class: "vnp-stats" });
    strip.append(stat(stats2.total, "Plugins"));
    strip.append(stat(stats2.enabled, "Enabled"));
    strip.append(stat("v" + VERSION, "Version"));
    root.append(strip);
    root.append(sectionTitle("How Venper works"));
    root.append(
      note(
        "Venper runs entirely in your browser (or inside the Yapper desktop app). It reads the same data Yapper already loaded and uses Yapper's own actions, so it plays by the same rules: it can't see anything you can't, and it can't do anything you couldn't do yourself."
      )
    );
    root.append(
      note(
        "<b>It is fully client-sided.</b> Venper has no server, no accounts and no telemetry, and it never reads or sends your login token. It only contacts another site when you use a plugin that needs one: <b>Translate</b> sends the message text to Google Translate, <b>FontLoader</b> loads fonts from Google Fonts, and the search plugins (Search with Google, Reverse image search, QuickSearch) open a search page in a new tab. The whole thing is open source, so anyone can check exactly what it does."
      )
    );
    root.append(
      note(
        "<b>A note on Yapper's rules.</b> Yapper's Terms don't allow client mods, so using Venper is at your own risk. Venper deliberately avoids anything that automates your account or bypasses a server rule (slowmode, bans, permissions, rate limits) — those are both against the rules and a good way to get banned.",
        "warn"
      )
    );
    root.append(sectionTitle("Links"));
    const links = el("div", { class: "vnp-btnrow" });
    links.append(button("Source code", "primary", () => open(REPO, "_blank")));
    links.append(button("Report a bug", null, () => open(REPO + "/issues", "_blank")));
    links.append(button("Releases", null, () => open(REPO + "/releases", "_blank")));
    root.append(links);
    root.append(
      el(
        "p",
        { class: "vnp-credit" },
        "Built on the desktop-injection approach pioneered by Yap++ (by @salami). Venper is not affiliated with Yapper."
      )
    );
  }
  function renderChangelog(root) {
    root.append(el("h2", {}, "Changelog"));
    root.append(el("p", { class: "vnp-head-sub" }, "What changed in each version of Venper."));
    for (const entry of CHANGELOG) {
      root.append(el("div", { class: "vnp-changelog-v" }, entry.v));
      const list = el("ul", { class: "vnp-changelog-list" });
      for (const n of entry.notes) list.append(el("li", { html: n }));
      root.append(list);
    }
  }
  var VERSION, REPO, CHANGELOG;
  var init_about = __esm({
    "src/core/ui/tabs/about.js"() {
      init_dom();
      init_panelWidgets();
      init_plugins();
      VERSION = "2.0.1";
      REPO = "https://github.com/yakazt/venper";
      CHANGELOG = [
        {
          v: `2.0.1`,
          notes: [
            "Fixed Venper's styles clashing with Yapper's video player: both used a <code>vp-</code> prefix. Venper now uses <code>vnp-</code> everywhere and no longer touches Yapper's player.",
            "Right-click menu: Venper's items now match Yapper's layout, close the menu when clicked, and the menu no longer runs off the bottom of the screen.",
            "MessageLogger: edit history appears right away, deleted messages keep their tag on grouped rows, ghosts survive deletes from other people and channel switches, and they no longer leak into other channels.",
            "Bookmarks: entries saved by the old client show the right author and text; the list shows where and when each message was sent and jumps there on click.",
            "Snowfall stays under menus and dialogs. The About page now lists exactly which plugins contact outside services."
          ]
        },
        {
          v: `2.0.0`,
          notes: [
            "Full rewrite. Venper is now a modular, open-source client built on Yapper's own data store instead of scraping the page — plugins read real data and are far more reliable.",
            "Brand-new native installer written in Rust: animated, no PowerShell, no download-at-install. What's in the repo is what gets installed.",
            "Removed the silent auto-updater that ran remote scripts on every launch. Updates are published builds with a checksum, and you choose when to update.",
            "Removed the fake staff/verified badges (account impersonation). Venper now has a local-only Venper badge instead.",
            "Comfier settings window kept and improved: smooth open animation and an adjustable size (Advanced tab)."
          ]
        }
      ];
    }
  });

  // src/core/ui/settingsPanel.js
  var settingsPanel_exports = {};
  __export(settingsPanel_exports, {
    install: () => install2,
    openTab: () => openTab
  });
  function applyComfy() {
    const modal = document.querySelector(".overlay .modal.wide");
    if (!modal) return;
    const comfy = getPref("comfySettings") !== false;
    modal.classList.toggle("vnp-comfy", comfy);
    const scale = Math.max(0.85, Math.min(1.3, getPref("settingsScale") || 1));
    modal.style.setProperty("--vnp-settings-scale", String(scale));
  }
  function settingsMain() {
    return document.querySelector(".settings-main");
  }
  function clearVenperActive() {
    document.querySelectorAll(".vnp-navbtn.vnp-active").forEach((b) => b.classList.remove("vnp-active"));
    activeTab = null;
  }
  function showTab(tabId) {
    const main = settingsMain();
    if (!main) return;
    const tab = TABS.find((t) => t.id === tabId);
    if (!tab) return;
    activeTab = tabId;
    document.querySelectorAll(".settings-nav .vnp-navbtn").forEach((b) => {
      b.classList.toggle("vnp-active", b.dataset.vnpTab === tabId);
    });
    document.querySelectorAll(".settings-nav button:not(.vnp-navbtn)").forEach((b) => b.classList.remove("active"));
    main.innerHTML = "";
    const panel = el("div", { id: "venper-panel", class: "vnp-scope" });
    try {
      tab.render(panel, { refresh: () => showTab(tabId) });
    } catch (e) {
      panel.append(el("div", { class: "vnp-pnote vnp-warn vnp-tab-error" }, "This tab hit an error. See the console."));
      console.error("[Venper] tab render failed", e);
    }
    main.appendChild(panel);
  }
  function injectNav(nav) {
    if (nav.querySelector(".vnp-navbtn")) return;
    const label = el("div", { class: "vnp-nav-label" }, el("span", { class: "vnp-dot" }), "Venper");
    nav.appendChild(label);
    for (const tab of TABS) {
      const btn = el(
        "button",
        { class: "vnp-navbtn", dataset: { vnpTab: tab.id } },
        svg(tab.icon, 16),
        el("span", {}, tab.label)
      );
      btn.addEventListener("click", () => showTab(tab.id));
      nav.appendChild(btn);
    }
    nav.querySelectorAll("button:not(.vnp-navbtn)").forEach((b) => {
      b.addEventListener("click", () => clearVenperActive(), true);
    });
  }
  function install2() {
    setStyle("venper-panel-css", PANEL_CSS);
    observe(".settings-nav", (nav) => {
      injectNav(nav);
      applyComfy();
    });
    observe(".overlay .modal.wide", () => applyComfy());
    observe(".settings", () => {
      const nav = document.querySelector(".settings-nav");
      if (nav && !nav.querySelector(".vnp-navbtn")) injectNav(nav);
    });
    onChange(() => applyComfy());
    onChange2(() => {
      if (activeTab === "plugins" && document.querySelector("#venper-panel")) showTab("plugins");
    });
  }
  function openTab(tabId) {
    showTab(tabId);
  }
  var ICONS, TABS, activeTab;
  var init_settingsPanel = __esm({
    "src/core/ui/settingsPanel.js"() {
      init_dom();
      init_plugins();
      init_settings();
      init_style();
      init_panelStyle();
      init_plugins2();
      init_themes2();
      init_backup();
      init_about();
      init_advanced();
      ICONS = {
        info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
        plugins: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
        brush: '<path d="M9 11 2 18a1.4 1.4 0 0 0 2 2l7-7"/><path d="M14.5 5.5 18.5 9.5 11 17H8v-3z"/><path d="M14.5 5.5 16 4a2.1 2.1 0 0 1 3 3l-1.5 1.5"/>',
        backup: '<path d="M21 8v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8"/><rect x="1" y="3" width="22" height="5" rx="1"/><path d="M10 12h4"/>',
        code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
        changelog: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6"/><path d="M9 17h6"/>'
      };
      TABS = [
        { id: "about", label: "Venper", icon: ICONS.info, render: renderAbout },
        { id: "plugins", label: "Plugins", icon: ICONS.plugins, render: renderPlugins },
        { id: "themes", label: "Themes", icon: ICONS.brush, render: renderThemes },
        { id: "backup", label: "Backup & Restore", icon: ICONS.backup, render: renderBackup },
        { id: "changelog", label: "Changelog", icon: ICONS.changelog, render: renderChangelog },
        { id: "advanced", label: "Advanced", icon: ICONS.code, render: renderAdvanced }
      ];
      activeTab = null;
    }
  });

  // src/plugins/commandPalette.js
  function builtinCommands() {
    const out = [
      {
        id: "open-settings",
        name: "Open Venper settings",
        kind: "Venper",
        run: () => openSettingsToVenper()
      }
    ];
    const s = state();
    for (const ch of Object.values(s.channels || {})) {
      if (ch.kind !== "text") continue;
      const srv = ch.server_id ? s.servers?.[ch.server_id]?.name : "Direct Messages";
      out.push({
        id: "goto-" + ch.id,
        name: "#" + (ch.name || "channel"),
        desc: srv,
        kind: "Jump",
        run: () => openChannel(ch.id)
      });
    }
    return out;
  }
  function openSettingsToVenper() {
    const gear = document.querySelector('.user-bar [aria-label="Settings"], .user-bar [title="Settings"]');
    gear?.click();
    setTimeout(() => Promise.resolve().then(() => (init_settingsPanel(), settingsPanel_exports)).then((m) => m.openTab("about")), 350);
  }
  function allCommands() {
    const plug = commands().map((c) => ({
      id: c.id,
      name: c.name,
      desc: c.description,
      kind: c.plugin.name,
      run: c.run
    }));
    return [...builtinCommands(), ...plug];
  }
  function fuzzy(items, query) {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 40);
    return items.map((it) => {
      const hay = (it.name + " " + (it.desc || "") + " " + it.kind).toLowerCase();
      const idx = hay.indexOf(q);
      return idx === -1 ? null : { it, score: idx };
    }).filter(Boolean).sort((a, b) => a.score - b.score).slice(0, 40).map((x) => x.it);
  }
  function openPalette() {
    if (overlay) return;
    const commands2 = allCommands();
    overlay = el("div", { class: "vnp-palette-overlay vnp-scope" });
    const input = el("input", { placeholder: "Type a command or a channel…", spellcheck: "false" });
    const list = el("div", { class: "vnp-palette-list" });
    const palette = el("div", { class: "vnp-palette" }, input, list);
    overlay.appendChild(palette);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    document.body.appendChild(overlay);
    let filtered = [];
    let sel = 0;
    const paint = () => {
      filtered = fuzzy(commands2, input.value);
      sel = Math.min(sel, filtered.length - 1);
      if (sel < 0) sel = 0;
      list.innerHTML = "";
      if (!filtered.length) {
        list.append(el("div", { class: "vnp-palette-empty" }, "No matches"));
        return;
      }
      filtered.forEach((c, i) => {
        const row2 = el(
          "div",
          { class: "vnp-palette-item" + (i === sel ? " vnp-sel" : "") },
          el("div", { class: "vnp-pi-main" }, el("div", { class: "vnp-pi-name" }, c.name), c.desc ? el("div", { class: "vnp-pi-desc" }, c.desc) : null),
          el("span", { class: "vnp-pi-kind" }, c.kind)
        );
        row2.addEventListener("click", () => run(c));
        row2.addEventListener("mousemove", () => {
          if (sel !== i) {
            sel = i;
            highlight();
          }
        });
        list.append(row2);
      });
    };
    const highlight = () => {
      [...list.children].forEach((row2, i) => row2.classList?.toggle("vnp-sel", i === sel));
      list.children[sel]?.scrollIntoView({ block: "nearest" });
    };
    const run = (c) => {
      close();
      try {
        c.run();
      } catch {
      }
    };
    input.addEventListener("input", paint);
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        sel = Math.min(sel + 1, filtered.length - 1);
        highlight();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        sel = Math.max(sel - 1, 0);
        highlight();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[sel]) run(filtered[sel]);
      } else if (e.key === "Escape") {
        close();
      }
    });
    paint();
    input.focus();
  }
  function close() {
    overlay?.remove();
    overlay = null;
  }
  var CSS4, overlay, commandPalette_default;
  var init_commandPalette = __esm({
    "src/plugins/commandPalette.js"() {
      init_dom();
      init_style();
      init_plugins();
      init_store();
      init_actions();
      CSS4 = `
.vnp-palette-overlay { position: fixed; inset: 0; z-index: 2147483200; background: #0007; display: grid; place-items: start center; padding-top: 12vh; animation: vnp-fade-in .12s ease; }
.vnp-palette { width: min(560px, 92vw); background: var(--bg-float, #1b1c21); border: 1px solid var(--border, #ffffff14); border-radius: 14px; box-shadow: 0 24px 70px #000b; overflow: hidden; animation: vnp-pop-in .16s cubic-bezier(.2,.8,.2,1); }
.vnp-palette input { width: 100%; box-sizing: border-box; background: transparent; border: 0; border-bottom: 1px solid var(--border, #2b2d31); color: var(--text, #fff); font: 16px var(--font, "Inter", sans-serif); padding: 16px 18px; outline: none; }
.vnp-palette-list { max-height: 50vh; overflow: auto; padding: 6px; }
.vnp-palette-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 9px; cursor: pointer; color: var(--text, #dbdee1); }
.vnp-palette-item.vnp-sel { background: var(--bg-active, #35373c); }
.vnp-palette-item .vnp-pi-main { flex: 1; min-width: 0; }
.vnp-palette-item .vnp-pi-name { font-weight: 600; font-size: 14px; }
.vnp-palette-item .vnp-pi-desc { font-size: 12px; color: var(--text-muted, #9c9daa); }
.vnp-palette-item .vnp-pi-kind { font-size: 10.5px; font-weight: 700; color: var(--text-faint, #888); background: var(--bg-elev, #2b2d31); border-radius: 5px; padding: 1px 7px; }
.vnp-palette-empty { padding: 22px; text-align: center; color: var(--text-muted, #9c9daa); font-size: 13px; }
`;
      overlay = null;
      commandPalette_default = {
        id: "commandpalette",
        name: "Command Palette",
        description: "Press Ctrl+Shift+P to quickly run Venper actions and jump between channels.",
        authors: ["yakazt"],
        tags: ["Utility"],
        defaultOn: true,
        _handler: null,
        start() {
          setStyle("venper-palette-css", CSS4);
          this._handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "p") {
              e.preventDefault();
              if (overlay) close();
              else openPalette();
            }
          };
          document.addEventListener("keydown", this._handler, true);
        },
        stop() {
          if (this._handler) document.removeEventListener("keydown", this._handler, true);
          close();
          setStyle("venper-palette-css", "");
        }
      };
    }
  });

  // src/plugins/credits.js
  var CREDITS;
  var init_credits = __esm({
    "src/plugins/credits.js"() {
      CREDITS = {
        basedecoder: { name: "DecodeBase64", from: "Equicord", authors: ["ThePirateStoner"] },
        blockkeywords: { name: "BlockKeywords", from: "Equicord", authors: ["catcraft", "secp192k1"] },
        bookmarks: { name: "savedMessages", from: "Nightcord", authors: [] },
        calltimer: { name: "CallTimer", from: "Vencord", authors: ["V", "MaxHerbold", "D3SOX"] },
        charcounter: { name: "CharacterCounter", from: "Vencord", authors: ["thororen", "creations"] },
        commandpalette: { name: "CommandPalette", from: "Equicord", authors: ["justjxke"] },
        compactmode: { name: "compactMode", from: "Nightcord", authors: [] },
        copyimagelink: { name: "imageLink", from: "Nightcord", authors: [] },
        cursorbuddy: { name: "CursorBuddy", from: "Equicord", authors: ["V", "adryd", "Nexpid", "ZcraftElite"] },
        custombackground: { name: "channelWallpaper", from: "Nightcord", authors: [] },
        downloadallattachments: { name: "DownloadAllAttachments", from: "Equicord", authors: ["dhopcs"] },
        exportmessages: { name: "ExportMessages", from: "Equicord", authors: ["veygax", "dat_insanity"] },
        fontloader: { name: "FontLoader", from: "Equicord", authors: ["vMohammad"] },
        googlethat: { name: "GoogleThat", from: "Equicord", authors: ["Samwich", "krystalskullofficial"] },
        imagezoom: { name: "ImageZoom", from: "Vencord", authors: ["Syncxv"] },
        keyboardsounds: { name: "KeyboardSounds", from: "Equicord", authors: ["HypedDomi", "Etorix"] },
        markallread: { name: "ReadAllNotificationsButton", from: "Vencord", authors: ["kemo", "krystalskullofficial"] },
        mediaplaybackspeed: { name: "MediaPlaybackSpeed", from: "Equicord", authors: ["D3SOX"] },
        membercount: { name: "MemberCount", from: "Vencord", authors: ["V", "Commandtechno", "Apexo"] },
        messagelogger: { name: "MessageLogger", from: "Vencord", authors: ["rushii", "V", "AutumnVN", "Nickyux", "Kyuuhachi", "sadan", "justjxke", "f3tch"] },
        nocaps: { name: "noCaps", from: "Nightcord", authors: [] },
        reverseimagesearch: { name: "ReverseImageSearch", from: "Vencord", authors: ["V", "Nuckyz"] },
        showmeyourname: { name: "ShowMeYourName", from: "Vencord", authors: ["Etorix", "rini", "TheKodeToad", "sadan", "prism", "penguinwokrs"] },
        silenttyping: { name: "SilentTyping", from: "Vencord", authors: ["V", "rini", "Im_Banana", "Etorix"] },
        snowfall: { name: "Snowfall", from: "Equicord", authors: ["ZcraftElite", "square"] },
        textreplace: { name: "TextReplace", from: "Vencord", authors: ["AutumnVN", "TheKodeToad", "Etorix", "Ape"] },
        timestamps: { name: "CustomTimestamps", from: "Equicord", authors: ["rini", "nvhhr", "Suffocate", "Obsidian"] },
        translate: { name: "Translate", from: "Vencord", authors: ["V", "AshtonMemer", "koish1"] },
        unitconverter: { name: "UnitConverter", from: "Equicord", authors: ["sadan"] },
        urlcleaner: { name: "ClearURLs", from: "Vencord", authors: ["adryd", "thororen"] }
      };
    }
  });

  // src/plugins/index.js
  var plugins_exports2 = {};
  __export(plugins_exports2, {
    registerBuiltins: () => registerBuiltins
  });
  function registerBuiltins() {
    const list = [
      messageLogger_default,
      ...chatQol_default,
      ...chatSend_default,
      ...appearance_default,
      ...utility_default,
      ...extras_default,
      commandPalette_default
    ];
    for (const p of list) if (CREDITS[p.id] && !p.basedOn) p.basedOn = CREDITS[p.id];
    registerAll(list);
  }
  var init_plugins3 = __esm({
    "src/plugins/index.js"() {
      init_plugins();
      init_messageLogger();
      init_chatQol();
      init_chatSend();
      init_appearance();
      init_utility();
      init_extras();
      init_commandPalette();
      init_credits();
    }
  });

  // src/index.js
  init_log();
  init_internals();
  init_store();
  init_actions();
  init_realtime();
  init_messages();
  init_plugins();
  init_settings();
  init_contextMenu();
  init_style();
  init_themes();
  init_toast();
  init_advanced();
  init_dom();
  var VERSION2 = "2.0.1";
  var Venper = {
    VERSION: VERSION2,
    store: store_exports,
    actions: actions_exports,
    realtime: realtime_exports,
    messages: messages_exports,
    plugins: plugins_exports,
    settings: settings_exports,
    toast,
    internals: internals_exports,
    themes: themes_exports,
    factoryReset,
    dispose,
    booted: false
  };
  function dispose() {
    for (const p of all()) {
      if (!p.__started) continue;
      try {
        p.stop?.();
      } catch {
      }
      p.__started = false;
    }
    try {
      uninstall();
    } catch {
    }
    disconnectAll();
    document.querySelectorAll('[id^="venper-"], [id^="vnp-"], .vnp-navbtn, .vnp-nav-label, [data-venper]').forEach((n) => n.remove());
    document.querySelectorAll(".vnp-comfy").forEach((n) => n.classList.remove("vnp-comfy"));
    if (window.__VENPER__ === Venper) delete window.__VENPER__;
    Venper.booted = false;
    log("disposed");
  }
  function waitForApp(timeout = 6e4) {
    return new Promise((resolve, reject) => {
      const start3 = Date.now();
      const tick = () => {
        if (hasRuntime() && ready()) return resolve();
        if (Date.now() - start3 > timeout) return reject(new Error("Yapper never became ready"));
        setTimeout(tick, 150);
      };
      tick();
    });
  }
  async function boot() {
    if (window.__VENPER__) {
      warn("Venper already loaded; skipping");
      return;
    }
    window.__VENPER__ = Venper;
    window.VENPER_VERSION = VERSION2;
    if (window.__VENPER_RESET__) {
      try {
        factoryReset(true);
      } catch {
      }
    }
    migrateLegacy();
    inject();
    apply();
    log(`Venper ${VERSION2} loading on ${location.host}`);
    try {
      await waitForApp();
    } catch (e) {
      warn(e.message);
      return;
    }
    install();
    start();
    start2();
    const { registerBuiltins: registerBuiltins2 } = await Promise.resolve().then(() => (init_plugins3(), plugins_exports2));
    registerBuiltins2();
    startEnabled();
    const ui = await Promise.resolve().then(() => (init_settingsPanel(), settingsPanel_exports));
    ui.install();
    Venper.booted = true;
    log(`ready — ${stats().enabled}/${stats().total} plugins on`);
  }
  if (document.readyState === "loading") {
    boot();
  } else {
    boot();
  }
})();
