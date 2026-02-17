import { defineComponent, ref, mergeProps, useSSRContext, computed } from "vue";
import { ssrRenderAttrs, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrRenderAttr, ssrRenderComponent } from "vue/server-renderer";
import { injected, createConfig, http } from "@wagmi/core";
import { base } from "@wagmi/core/chains";
import { b as useRuntimeConfig } from "../server.mjs";
import "/Users/juliuswong/Dev/AavegotchiPetterUI/node_modules/hookable/dist/index.mjs";
import "ofetch";
import "#internal/nuxt/paths";
import "/Users/juliuswong/Dev/AavegotchiPetterUI/node_modules/unctx/dist/index.mjs";
import "/Users/juliuswong/Dev/AavegotchiPetterUI/node_modules/nuxt/node_modules/h3/dist/index.mjs";
import "vue-router";
import "/Users/juliuswong/Dev/AavegotchiPetterUI/node_modules/radix3/dist/index.mjs";
import "/Users/juliuswong/Dev/AavegotchiPetterUI/node_modules/defu/dist/defu.mjs";
import "/Users/juliuswong/Dev/AavegotchiPetterUI/node_modules/ufo/dist/index.mjs";
const metaMaskConnector = injected({ target: "metaMask" });
const coinbaseConnector = injected({ target: "coinbaseWallet" });
createConfig({
  chains: [base],
  connectors: [metaMaskConnector, coinbaseConnector],
  transports: {
    [base.id]: http()
  }
});
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "WalletConnect",
  __ssrInlineRender: true,
  setup(__props) {
    var _a;
    const config = useRuntimeConfig();
    (((_a = config.public) == null ? void 0 : _a.allowedAddress) || "0x2127aa7265d573aa467f1d73554d17890b872e76").toLowerCase();
    const address = ref("");
    const isConnected = ref(false);
    const isAuthenticated = ref(false);
    const connecting = ref(false);
    const signing = ref(false);
    const error = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "wallet-connect" }, _attrs))}>`);
      if (!isConnected.value) {
        _push(`<div class="space-y-4"><p class="text-slate-400">Connect with MetaMask or Coinbase Wallet only</p><div class="flex flex-col sm:flex-row gap-3"><button${ssrIncludeBooleanAttr(connecting.value) ? " disabled" : ""} class="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium">${ssrInterpolate(connecting.value ? "Connecting..." : "MetaMask")}</button><button${ssrIncludeBooleanAttr(connecting.value) ? " disabled" : ""} class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium">${ssrInterpolate(connecting.value ? "Connecting..." : "Coinbase Wallet")}</button></div>`);
        if (error.value) {
          _push(`<p class="text-red-400 text-sm">${ssrInterpolate(error.value)}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (error.value) {
          _push(`<p class="text-slate-400 text-xs mt-1"> Have Uniswap or other wallets? Disable them or use a private window with only MetaMask or Coinbase Wallet. </p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<div class="space-y-4"><div class="bg-emerald-500/20 border border-emerald-500/50 rounded-lg p-4"><p class="text-emerald-400 font-medium">Connected</p><p class="text-slate-300 text-sm mt-1 break-all">${ssrInterpolate(address.value)}</p></div>`);
        if (!isAuthenticated.value) {
          _push(`<button${ssrIncludeBooleanAttr(signing.value) ? " disabled" : ""} class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">${ssrInterpolate(signing.value ? "Signing..." : "Sign Message to Login")}</button>`);
        } else {
          _push(`<button class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"> Disconnect </button>`);
        }
        _push(`</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/WalletConnect.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "BotControl",
  __ssrInlineRender: true,
  setup(__props) {
    const status = ref({ running: false });
    const loading = ref(true);
    const toggling = ref(false);
    const triggering = ref(false);
    const formatDate = (timestamp) => {
      return new Date(timestamp).toLocaleString();
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bot-control" }, _attrs))}><div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6"><h2 class="text-lg font-semibold mb-4">Bot Control</h2>`);
      if (loading.value) {
        _push(`<div class="text-center py-4"><p class="text-slate-400">Loading...</p></div>`);
      } else {
        _push(`<div class="space-y-4"><div class="flex items-center justify-between"><div><p class="text-sm text-slate-400">Status</p><p class="${ssrRenderClass([status.value.running ? "text-emerald-400" : "text-red-400", "text-lg font-semibold"])}">${ssrInterpolate(status.value.running ? "Running" : "Stopped")}</p></div>`);
        if (status.value.lastRun) {
          _push(`<div><p class="text-sm text-slate-400">Last Run</p><p class="text-lg font-semibold">${ssrInterpolate(formatDate(status.value.lastRun))}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (status.value.lastError) {
          _push(`<div class="bg-red-500/20 border border-red-500/50 rounded-lg p-4"><p class="text-red-400 font-medium">Last Error</p><p class="text-red-300 text-sm mt-1">${ssrInterpolate(status.value.lastError)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex gap-4"><button${ssrIncludeBooleanAttr(toggling.value) ? " disabled" : ""} class="${ssrRenderClass([
          "px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed",
          status.value.running ? "bg-red-600 text-white hover:bg-red-700" : "bg-emerald-600 text-white hover:bg-emerald-700"
        ])}">${ssrInterpolate(toggling.value ? "Processing..." : status.value.running ? "Stop Bot" : "Start Bot")}</button><button${ssrIncludeBooleanAttr(triggering.value) ? " disabled" : ""} class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">${ssrInterpolate(triggering.value ? "Running..." : "Trigger Now")}</button></div></div>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/BotControl.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "DelegationCard",
  __ssrInlineRender: true,
  setup(__props) {
    const status = ref(null);
    const petterAddress = ref("");
    const loading = ref(true);
    const approving = ref(false);
    const registering = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "delegation-card" }, _attrs))}><div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6"><h2 class="text-lg font-semibold mb-2">EIP PetOperator Delegation</h2><p class="text-slate-400 text-sm mb-4"> Keep your Aavegotchis in your wallet. Approve our petter to pet on your behalf—no transfer needed. </p>`);
      if (loading.value) {
        _push(`<div class="text-center py-4"><p class="text-slate-400">Loading...</p></div>`);
      } else {
        _push(`<div class="space-y-4"><div class="bg-white/5 rounded-lg p-4 font-mono text-sm break-all"><span class="text-slate-400">Petter address: </span> ${ssrInterpolate(petterAddress.value || "—")}</div><div class="space-y-2"><div class="flex items-center gap-2"><span class="${ssrRenderClass([((_a = status.value) == null ? void 0 : _a.approved) ? "bg-emerald-500" : "bg-amber-500", "w-3 h-3 rounded-full"])}"></span><span>${ssrInterpolate(((_b = status.value) == null ? void 0 : _b.approved) ? "Approved" : "Not approved")}</span></div><div class="flex items-center gap-2"><span class="${ssrRenderClass([((_c = status.value) == null ? void 0 : _c.registered) ? "bg-emerald-500" : "bg-slate-500", "w-3 h-3 rounded-full"])}"></span><span>${ssrInterpolate(((_d = status.value) == null ? void 0 : _d.registered) ? "Registered" : "Not registered")}</span></div>`);
        if (((_e = status.value) == null ? void 0 : _e.gotchiCount) !== void 0) {
          _push(`<div class="text-sm text-slate-400">${ssrInterpolate(status.value.gotchiCount)} Aavegotchi(es) in your wallet </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="flex flex-col gap-2">`);
        if (!((_f = status.value) == null ? void 0 : _f.approved)) {
          _push(`<button${ssrIncludeBooleanAttr(approving.value) ? " disabled" : ""} class="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 font-medium">${ssrInterpolate(approving.value ? "Confirm in wallet..." : "1. Approve Petter (sign tx)")}</button>`);
        } else if ((_g = status.value) == null ? void 0 : _g.canRegister) {
          _push(`<button${ssrIncludeBooleanAttr(registering.value) ? " disabled" : ""} class="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">${ssrInterpolate(registering.value ? "Registering..." : "2. Register for Auto-Petting")}</button>`);
        } else if ((_h = status.value) == null ? void 0 : _h.registered) {
          _push(`<div class="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm border border-emerald-500/50"> ✓ You&#39;re all set! Your Aavegotchis will be petted every 12 hours. </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/DelegationCard.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "DelegationList",
  __ssrInlineRender: true,
  setup(__props) {
    const owners = ref([]);
    const totalGotchis = ref(0);
    const loading = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "delegation-list" }, _attrs))}><div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6"><div class="flex items-center justify-between mb-4"><h2 class="text-lg font-semibold">Delegating Owners</h2><button${ssrIncludeBooleanAttr(loading.value) ? " disabled" : ""} class="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition disabled:opacity-50">${ssrInterpolate(loading.value ? "Loading..." : "Refresh")}</button></div>`);
      if (loading.value && owners.value.length === 0) {
        _push(`<div class="text-center py-8 text-slate-400"><p>Loading delegation list...</p></div>`);
      } else if (owners.value.length === 0) {
        _push(`<div class="text-center py-8 text-slate-400"><p>No users have delegated petting yet</p></div>`);
      } else {
        _push(`<div class="space-y-4"><div class="flex justify-between text-sm text-slate-400 mb-2"><span>Total: ${ssrInterpolate(owners.value.length)} owner(s)</span><span class="font-semibold text-white">${ssrInterpolate(totalGotchis.value)} Aavegotchis to pet</span></div><div class="space-y-2 max-h-64 overflow-y-auto"><!--[-->`);
        ssrRenderList(owners.value, (item) => {
          _push(`<div class="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition"><a${ssrRenderAttr("href", `https://basescan.org/address/${item.address}`)} target="_blank" rel="noopener noreferrer" class="font-mono text-sm text-blue-400 hover:text-blue-300 truncate flex-1 min-w-0">${ssrInterpolate(item.address.slice(0, 6))}...${ssrInterpolate(item.address.slice(-4))}</a><span class="text-emerald-400 font-medium ml-3 shrink-0">${ssrInterpolate(item.gotchiCount)} gotchi${ssrInterpolate(item.gotchiCount !== 1 ? "s" : "")}</span></div>`);
        });
        _push(`<!--]--></div></div>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/DelegationList.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "HomeDashboard",
  __ssrInlineRender: true,
  setup(__props) {
    const health = ref(null);
    const history = ref([]);
    const delegationStatus = ref(null);
    const walletBalance = ref(null);
    ref(true);
    const historyLoading = ref(false);
    const isAuthenticated = ref(false);
    const status = computed(() => {
      var _a, _b, _c, _d, _e, _f;
      return {
        running: ((_b = (_a = health.value) == null ? void 0 : _a.bot) == null ? void 0 : _b.running) ?? false,
        lastRun: ((_d = (_c = health.value) == null ? void 0 : _c.bot) == null ? void 0 : _d.lastRun) ?? null,
        lastError: ((_f = (_e = health.value) == null ? void 0 : _e.bot) == null ? void 0 : _f.lastError) ?? null
      };
    });
    const stats = computed(() => {
      var _a;
      return ((_a = health.value) == null ? void 0 : _a.stats) ?? { successRate: 100 };
    });
    const nextPetTimer = computed(() => {
      var _a, _b;
      const lastRun = (_b = (_a = health.value) == null ? void 0 : _a.bot) == null ? void 0 : _b.lastRun;
      if (!lastRun) return "—";
      const lastRunMs = new Date(lastRun).getTime();
      const nextRunMs = lastRunMs + 12 * 60 * 60 * 1e3;
      const now = Date.now();
      if (now >= nextRunMs) return "Ready";
      const diff = nextRunMs - now;
      const h = Math.floor(diff / 36e5);
      const m = Math.floor(diff % 36e5 / 6e4);
      return `${h}h ${m}m`;
    });
    const walletAddress = ref(null);
    const successRateColor = computed(() => {
      var _a;
      const rate = ((_a = stats.value) == null ? void 0 : _a.successRate) ?? 100;
      if (rate >= 95) return "text-emerald-400";
      if (rate >= 80) return "text-amber-400";
      return "text-red-400";
    });
    const formatDate = (val) => {
      if (!val) return "—";
      const ts = typeof val === "string" ? new Date(val).getTime() : val;
      return new Date(ts).toLocaleString();
    };
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_WalletConnect = _sfc_main$5;
      const _component_BotControl = _sfc_main$4;
      const _component_DelegationCard = _sfc_main$3;
      const _component_DelegationList = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "home-dashboard min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white p-4 md:p-8" }, _attrs))}><div class="max-w-6xl mx-auto space-y-6"><div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"><div><h1 class="text-3xl md:text-4xl font-bold tracking-tight">Aavegotchi Petter</h1><p class="text-slate-400 mt-1">Automated petting on Base • Every 12 hours</p></div><div class="flex items-center gap-3"><div class="${ssrRenderClass([status.value.running ? "bg-emerald-500/20 border border-emerald-500/50" : "bg-amber-500/20 border border-amber-500/50", "flex items-center gap-2 px-4 py-2 rounded-lg"])}"><div class="${ssrRenderClass([status.value.running ? "bg-emerald-400" : "bg-amber-400", "w-2 h-2 rounded-full animate-pulse"])}"></div><span class="text-sm font-medium">${ssrInterpolate(status.value.running ? "Running" : "Stopped")}</span></div>`);
      if (isAuthenticated.value) {
        _push(`<button class="px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded-lg text-sm font-medium transition"> Logout </button>`);
      } else {
        _push(ssrRenderComponent(_component_WalletConnect, null, null, _parent));
      }
      _push(`</div></div><div class="grid grid-cols-2 md:grid-cols-4 gap-4"><div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4"><p class="text-slate-400 text-sm">Next Pet</p><p class="text-xl font-bold mt-1 font-mono">${ssrInterpolate(nextPetTimer.value)}</p></div><div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4"><p class="text-slate-400 text-sm">Total Petted</p><p class="text-xl font-bold mt-1">${ssrInterpolate(stats.value.totalAavegotchisPetted ?? 0)}</p></div><div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4"><p class="text-slate-400 text-sm">Success Rate</p><p class="${ssrRenderClass([successRateColor.value, "text-xl font-bold mt-1"])}">${ssrInterpolate(stats.value.successRate ?? 100)}%</p></div><div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4"><p class="text-slate-400 text-sm">Last 24h</p><p class="text-xl font-bold mt-1">${ssrInterpolate(stats.value.transactionsLast24h ?? 0)}</p></div></div>`);
      if (isAuthenticated.value) {
        _push(`<div class="grid md:grid-cols-2 gap-6"><div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6"><h2 class="text-lg font-semibold mb-4">Wallet</h2><div class="space-y-3"><div><p class="text-slate-400 text-sm">Address</p><p class="font-mono text-sm break-all mt-1">${ssrInterpolate(walletAddress.value || "—")}</p></div><div><p class="text-slate-400 text-sm">Balance (ETH)</p><p class="font-mono text-lg font-bold mt-1">${ssrInterpolate(walletBalance.value ?? "—")}</p></div><div><p class="text-slate-400 text-sm">Gotchis Delegated</p><p class="font-mono text-lg font-bold mt-1">${ssrInterpolate(((_a = delegationStatus.value) == null ? void 0 : _a.gotchiCount) ?? "—")}</p></div></div></div><div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6"><h2 class="text-lg font-semibold mb-4">Bot Status</h2><div class="space-y-3"><div><p class="text-slate-400 text-sm">Last Run</p><p class="mt-1">${ssrInterpolate(formatDate(status.value.lastRun))}</p></div>`);
        if (status.value.lastError) {
          _push(`<div><p class="text-slate-400 text-sm">Last Error</p><p class="text-red-400 text-sm mt-1 truncate">${ssrInterpolate(status.value.lastError)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6"><div class="flex items-center justify-between mb-4"><h2 class="text-lg font-semibold">Execution History</h2>`);
      if (isAuthenticated.value) {
        _push(`<button${ssrIncludeBooleanAttr(historyLoading.value) ? " disabled" : ""} class="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition disabled:opacity-50"> Refresh </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (!isAuthenticated.value) {
        _push(`<div class="text-center py-12 text-slate-400"><p>Connect wallet to view execution history</p></div>`);
      } else if (historyLoading.value) {
        _push(`<div class="text-center py-12 text-slate-400"><p>Loading...</p></div>`);
      } else if (history.value.length === 0) {
        _push(`<div class="text-center py-12 text-slate-400"><p>No executions yet</p></div>`);
      } else {
        _push(`<div class="space-y-3 max-h-64 overflow-y-auto"><!--[-->`);
        ssrRenderList(history.value, (tx) => {
          _push(`<div class="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition"><div class="flex-1 min-w-0"><a${ssrRenderAttr("href", `https://basescan.org/tx/${tx.hash}`)} target="_blank" rel="noopener noreferrer" class="font-mono text-sm text-blue-400 hover:text-blue-300 truncate block">${ssrInterpolate(tx.hash.slice(0, 10))}...${ssrInterpolate(tx.hash.slice(-8))}</a><p class="text-slate-400 text-xs mt-1">${ssrInterpolate(formatDate(tx.timestamp))} • ${ssrInterpolate(tx.tokenIds.length)} petted</p></div><span class="text-emerald-400 text-xs font-medium ml-2">Success</span></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div>`);
      if (isAuthenticated.value) {
        _push(`<div class="grid md:grid-cols-2 gap-6 mt-6">`);
        _push(ssrRenderComponent(_component_BotControl, null, null, _parent));
        _push(ssrRenderComponent(_component_DelegationCard, null, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (isAuthenticated.value) {
        _push(`<div class="mt-6">`);
        _push(ssrRenderComponent(_component_DelegationList, null, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/HomeDashboard.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_HomeDashboard = _sfc_main$1;
      _push(ssrRenderComponent(_component_HomeDashboard, _attrs, null, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=index-t7m9NxF9.js.map
