import { defineComponent, computed, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderAttrs, ssrInterpolate, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { injected, createConfig, http } from '@wagmi/core';
import { base } from '@wagmi/core/chains';
import { b as useRuntimeConfig } from './server.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'vue-router';

function shortenAddress(addr) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
const metaMaskConnector = injected({ target: "metaMask" });
const coinbaseConnector = injected({ target: "coinbaseWallet" });
createConfig({
  chains: [base],
  connectors: [metaMaskConnector, coinbaseConnector],
  transports: {
    [base.id]: http()
  },
  ssr: true
});
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "WalletConnect",
  __ssrInlineRender: true,
  setup(__props) {
    var _a, _b;
    const config = useRuntimeConfig();
    const allowedAddress = (((_a = config.public) == null ? void 0 : _a.allowedAddress) || "0x2127aa7265d573aa467f1d73554d17890b872e76").toLowerCase();
    const allowedAddressesRaw = (_b = config.public) == null ? void 0 : _b.allowedAddresses;
    allowedAddressesRaw ? allowedAddressesRaw.split(",").map((a) => a.trim().toLowerCase()).filter(Boolean) : [allowedAddress];
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
          _push(`<p class="text-amber-400/90 text-sm"> Sign in below to access Bot Control, Delegation List, and full dashboard. </p>`);
        } else {
          _push(`<!---->`);
        }
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
  emits: ["triggered"],
  setup(__props, { emit: __emit }) {
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
        if (status.value.lastRunMessage && !status.value.lastError) {
          _push(`<div class="bg-white/5 border border-white/10 rounded-lg p-4"><p class="text-slate-400 text-sm font-medium">Last Outcome</p><p class="text-slate-300 text-sm mt-1">${ssrInterpolate(status.value.lastRunMessage)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
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
const CORRECT_PETTER_ADDRESS = "0x9a3E95f448f3daB367dd9213D4554444faa272F1";
const DEPRECATED_PETTER_ADDRESSES = ["0xb4c123857ea7d2f1343d749818c19af439c65e15", "0x6c5fc27f465ac73466d3a10508d2ed8a68364bbf", "0xeFa494C63865e9Ab9DF001041558f26FaC897002"];
function useDelegationStatus() {
  var _a;
  const config = useRuntimeConfig();
  let petterAddress = ((_a = config.public) == null ? void 0 : _a.petterAddress) || CORRECT_PETTER_ADDRESS;
  if (DEPRECATED_PETTER_ADDRESSES.includes(petterAddress.toLowerCase())) {
    petterAddress = CORRECT_PETTER_ADDRESS;
  }
  const status = ref(null);
  const loading = ref(true);
  const fetchStatus = async () => {
    return;
  };
  return { status, loading, petterAddress, fetchStatus };
}
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "DelegationCard",
  __ssrInlineRender: true,
  setup(__props) {
    const { status, loading, petterAddress } = useDelegationStatus();
    const revokeAddress = ref("");
    const approving = ref(false);
    const registering = ref(false);
    const revoking = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "delegation-card" }, _attrs))}><div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6"><h2 class="text-lg font-semibold mb-2">EIP PetOperator Delegation</h2><p class="text-slate-400 text-sm mb-4"> Keep your Aavegotchis in your wallet. Approve our petter to pet on your behalf\u2014no transfer needed. </p>`);
      if (unref(loading)) {
        _push(`<div class="text-center py-4"><p class="text-slate-400">Loading...</p></div>`);
      } else if (!unref(status)) {
        _push(`<div class="text-center py-4"><p class="text-slate-400">Connect your wallet to view delegation status. If already connected, refresh the page.</p></div>`);
      } else {
        _push(`<div class="space-y-4"><div class="bg-white/5 rounded-lg p-4 font-mono text-sm break-all"><span class="text-slate-400">Petter address: </span> ${ssrInterpolate(unref(petterAddress) || "\u2014")}</div><div class="space-y-2"><div class="flex items-center gap-2"><span class="${ssrRenderClass([((_a = unref(status)) == null ? void 0 : _a.approved) ? "bg-emerald-500" : "bg-amber-500", "w-3 h-3 rounded-full"])}"></span><span>${ssrInterpolate(((_b = unref(status)) == null ? void 0 : _b.approved) ? "Approved" : "Not approved")}</span></div><div class="flex items-center gap-2"><span class="${ssrRenderClass([((_c = unref(status)) == null ? void 0 : _c.registered) ? "bg-emerald-500" : "bg-slate-500", "w-3 h-3 rounded-full"])}"></span><span>${ssrInterpolate(((_d = unref(status)) == null ? void 0 : _d.registered) ? "Registered" : "Not registered")}</span></div>`);
        if (((_e = unref(status)) == null ? void 0 : _e.gotchiCount) !== void 0) {
          _push(`<div class="text-sm text-slate-400">${ssrInterpolate(unref(status).gotchiCount)} Aavegotchi(es) in your wallet </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="flex flex-col gap-2">`);
        if (!((_f = unref(status)) == null ? void 0 : _f.approved)) {
          _push(`<button${ssrIncludeBooleanAttr(approving.value) ? " disabled" : ""} class="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 font-medium">${ssrInterpolate(approving.value ? "Confirm in wallet..." : "1. Approve Petter (sign tx)")}</button>`);
        } else if ((_g = unref(status)) == null ? void 0 : _g.canRegister) {
          _push(`<!--[--><button${ssrIncludeBooleanAttr(registering.value) ? " disabled" : ""} class="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">${ssrInterpolate(registering.value ? "Registering..." : "2. Register for Auto-Petting")}</button><button${ssrIncludeBooleanAttr(revoking.value) ? " disabled" : ""} class="px-4 py-2 text-slate-400 hover:text-white text-sm">${ssrInterpolate(revoking.value ? "Revoking..." : "Revoke approval")}</button><!--]-->`);
        } else if ((_h = unref(status)) == null ? void 0 : _h.registered) {
          _push(`<!--[--><div class="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm border border-emerald-500/50"> \u2713 You&#39;re all set! Your Aavegotchis will be petted every 12 hours. </div><button${ssrIncludeBooleanAttr(revoking.value) ? " disabled" : ""} class="px-4 py-2 bg-red-600/80 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 text-sm font-medium">${ssrInterpolate(revoking.value ? "Revoking..." : "Revoke & Change Petter")}</button><div class="mt-2 pt-2 border-t border-white/10"><p class="text-slate-400 text-xs mb-1">Revoke a different petter address:</p><div class="flex flex-wrap gap-2 items-center">`);
          if (unref(petterAddress)) {
            _push(`<button type="button"${ssrIncludeBooleanAttr(revoking.value) ? " disabled" : ""} class="px-3 py-1.5 bg-red-600/60 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"> Revoke ${ssrInterpolate(unref(shortenAddress)(unref(petterAddress)))}</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<input${ssrRenderAttr("value", revokeAddress.value)} type="text" placeholder="0x..." class="flex-1 min-w-[140px] bg-white/10 border border-white/20 rounded px-3 py-1.5 text-sm font-mono placeholder-slate-500"><button type="button"${ssrIncludeBooleanAttr(revoking.value || !revokeAddress.value) ? " disabled" : ""} class="px-3 py-1.5 bg-red-600/60 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"> Revoke </button></div></div><!--]-->`);
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
    const clearing = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "delegation-list" }, _attrs))}><div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6"><div class="flex items-center justify-between mb-4"><h2 class="text-lg font-semibold">Delegating Owners</h2><button${ssrIncludeBooleanAttr(loading.value) ? " disabled" : ""} class="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition disabled:opacity-50">${ssrInterpolate(loading.value ? "Loading..." : "Refresh")}</button></div>`);
      if (loading.value && owners.value.length === 0) {
        _push(`<div class="text-center py-8 text-slate-400"><p>Loading delegation list...</p></div>`);
      } else if (owners.value.length === 0) {
        _push(`<div class="text-center py-8 text-slate-400"><p>No users have delegated petting yet</p></div>`);
      } else {
        _push(`<div class="space-y-4"><div class="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-400 mb-2"><span>Total: ${ssrInterpolate(owners.value.length)} owner(s)</span><span class="font-semibold text-white">${ssrInterpolate(totalGotchis.value)} Aavegotchis to pet</span>`);
        if (owners.value.length > 0) {
          _push(`<button type="button"${ssrIncludeBooleanAttr(clearing.value) ? " disabled" : ""} class="px-3 py-1.5 text-sm bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition disabled:opacity-50">${ssrInterpolate(clearing.value ? "Clearing..." : "Unregister all")}</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="space-y-2 max-h-64 overflow-y-auto"><!--[-->`);
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
    const config = useRuntimeConfig();
    const workerEnabled = computed(() => config.public.workerEnabled === true);
    const health = ref(null);
    const history = ref([]);
    const { petterAddress } = useDelegationStatus();
    const petterBalance = ref(null);
    const petterBalanceAddress = ref(null);
    const balanceRefreshing = ref(false);
    const totalGotchisDelegated = ref(null);
    const workerLogs = ref([]);
    const pettingIntervalHours = ref(12);
    const frequencySaving = ref(false);
    const testModeCountdown = ref(null);
    ref(true);
    const historyLoading = ref(false);
    const historyClearing = ref(false);
    const manualPetting = ref(false);
    const configCheckLoading = ref(false);
    const workerLogsLoading = ref(false);
    const backfillLoading = ref(false);
    const isAuthenticated = ref(false);
    const status = computed(() => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      return {
        running: ((_b = (_a = health.value) == null ? void 0 : _a.bot) == null ? void 0 : _b.running) ?? false,
        lastRun: ((_d = (_c = health.value) == null ? void 0 : _c.bot) == null ? void 0 : _d.lastRun) ?? null,
        lastError: ((_f = (_e = health.value) == null ? void 0 : _e.bot) == null ? void 0 : _f.lastError) ?? null,
        lastRunMessage: ((_h = (_g = health.value) == null ? void 0 : _g.bot) == null ? void 0 : _h.lastRunMessage) ?? null
      };
    });
    const stats = computed(() => {
      var _a;
      return ((_a = health.value) == null ? void 0 : _a.stats) ?? { successRate: 100 };
    });
    const nextPetTimer = computed(() => {
      var _a, _b;
      const lastRun = (_b = (_a = health.value) == null ? void 0 : _a.bot) == null ? void 0 : _b.lastRun;
      if (!lastRun) return "\u2014";
      const lastRunMs = new Date(lastRun).getTime();
      const intervalMs = pettingIntervalHours.value * 60 * 60 * 1e3;
      const nextRunMs = lastRunMs + intervalMs;
      const now = Date.now();
      if (now >= nextRunMs) return "Ready";
      const diff = nextRunMs - now;
      const h = Math.floor(diff / 36e5);
      const m = Math.floor(diff % 36e5 / 6e4);
      return `${h}h ${m}m`;
    });
    const hourOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
    const pettingIntervalLabel = computed(() => {
      const h = pettingIntervalHours.value;
      if (h < 1 / 60) return `Every ${Math.round(h * 3600)} sec (test)`;
      if (h < 1) return `Every ${Math.round(h * 60)} min`;
      return `Every ${h} ${h === 1 ? "hour" : "hours"}`;
    });
    const successRateColor = computed(() => {
      var _a;
      const rate = ((_a = stats.value) == null ? void 0 : _a.successRate) ?? 100;
      if (rate >= 95) return "text-emerald-400";
      if (rate >= 80) return "text-amber-400";
      return "text-red-400";
    });
    const fetchHistory = async () => {
      if (!isAuthenticated.value) return;
      historyLoading.value = true;
      try {
        const data = await $fetch("/api/transactions", { query: { limit: 20 } });
        history.value = data;
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        historyLoading.value = false;
      }
    };
    const fetchWorkerLogs = async () => {
      if (!isAuthenticated.value) return;
      workerLogsLoading.value = true;
      try {
        const data = await $fetch("/api/bot/logs", {
          query: { limit: 100 }
        });
        workerLogs.value = data;
      } catch (err) {
        console.error("Failed to fetch worker logs:", err);
        workerLogs.value = [];
      } finally {
        workerLogsLoading.value = false;
      }
    };
    const formatDate = (val) => {
      if (!val) return "\u2014";
      const ts = typeof val === "string" ? new Date(val).getTime() : val;
      return new Date(ts).toLocaleString();
    };
    const formatLogTime = (ts) => {
      const d = new Date(ts);
      return d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    };
    const formatGasCost = (eth) => {
      if (eth == null || eth === 0) return "\u2014";
      if (eth < 1e-4) return "<0.0001 ETH";
      return `${eth.toFixed(4)} ETH`;
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_WalletConnect = _sfc_main$5;
      const _component_BotControl = _sfc_main$4;
      const _component_DelegationCard = _sfc_main$3;
      const _component_DelegationList = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "home-dashboard min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white p-4 md:p-8" }, _attrs))}><div class="max-w-6xl mx-auto space-y-6"><div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"><div><h1 class="text-3xl md:text-4xl font-bold tracking-tight">Aavegotchi Petter</h1><p class="text-slate-400 mt-1">Automated petting on Base \u2022 ${ssrInterpolate(pettingIntervalLabel.value)}</p></div><div class="flex items-center gap-3"><div class="${ssrRenderClass([status.value.running ? "bg-emerald-500/20 border border-emerald-500/50" : "bg-amber-500/20 border border-amber-500/50", "flex items-center gap-2 px-4 py-2 rounded-lg"])}"><div class="${ssrRenderClass([status.value.running ? "bg-emerald-400" : "bg-amber-400", "w-2 h-2 rounded-full animate-pulse"])}"></div><span class="text-sm font-medium">${ssrInterpolate(status.value.running ? "Running" : "Stopped")}</span></div>`);
      if (isAuthenticated.value) {
        _push(`<button class="px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded-lg text-sm font-medium transition"> Logout </button>`);
      } else {
        _push(ssrRenderComponent(_component_WalletConnect, null, null, _parent));
      }
      _push(`</div></div><div class="grid grid-cols-2 md:grid-cols-5 gap-4"><div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4"><p class="text-slate-400 text-sm">Next Pet</p><p class="text-xl font-bold mt-1 font-mono">${ssrInterpolate(nextPetTimer.value)}</p></div><div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4"><p class="text-slate-400 text-sm">Total Petted</p><p class="text-xl font-bold mt-1">${ssrInterpolate(stats.value.totalAavegotchisPetted ?? 0)}</p></div><div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4"><p class="text-slate-400 text-sm">Success Rate</p><p class="${ssrRenderClass([successRateColor.value, "text-xl font-bold mt-1"])}">${ssrInterpolate(stats.value.successRate ?? 100)}%</p></div><div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4"><p class="text-slate-400 text-sm">Last 24h</p><p class="text-xl font-bold mt-1">${ssrInterpolate(stats.value.transactionsLast24h ?? 0)}</p></div><div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4"><div class="flex items-center justify-between gap-2"><div><p class="text-slate-400 text-sm">Gas Cost</p><p class="text-xl font-bold mt-1 font-mono">${ssrInterpolate(formatGasCost(stats.value.totalGasCostEth))}</p></div>`);
      if (isAuthenticated.value && formatGasCost(stats.value.totalGasCostEth) === "\u2014") {
        _push(`<button${ssrIncludeBooleanAttr(backfillLoading.value) ? " disabled" : ""} class="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded transition disabled:opacity-50 shrink-0">${ssrInterpolate(backfillLoading.value ? "..." : "Look up")}</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div>`);
      if (isAuthenticated.value) {
        _push(`<div class="grid md:grid-cols-2 gap-6"><div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6"><div class="flex items-center justify-between mb-4"><h2 class="text-lg font-semibold">Petter Wallet</h2><button${ssrIncludeBooleanAttr(balanceRefreshing.value) ? " disabled" : ""} class="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded transition disabled:opacity-50">${ssrInterpolate(balanceRefreshing.value ? "..." : "Refresh")}</button></div><div class="space-y-3"><div><p class="text-slate-400 text-sm">Address</p><p class="font-mono text-sm break-all mt-1">${ssrInterpolate(unref(petterAddress) || "\u2014")}</p></div><div><p class="text-slate-400 text-sm">Balance (ETH)</p><p class="font-mono text-lg font-bold mt-1">${ssrInterpolate(petterBalance.value ?? "\u2014")}</p>`);
        if (petterBalanceAddress.value) {
          _push(`<p class="text-slate-500 text-xs mt-0.5"> from ${ssrInterpolate(petterBalanceAddress.value.slice(0, 10))}...${ssrInterpolate(petterBalanceAddress.value.slice(-8))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div><p class="text-slate-400 text-sm">Gotchis Delegated</p><p class="font-mono text-lg font-bold mt-1">${ssrInterpolate(totalGotchisDelegated.value ?? "\u2014")}</p></div></div></div><div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6"><h2 class="text-lg font-semibold mb-4">Bot Status</h2><div class="space-y-3"><div><p class="text-slate-400 text-sm">Last Run</p><p class="mt-1">${ssrInterpolate(formatDate(status.value.lastRun))}</p></div>`);
        if (status.value.lastRunMessage && !status.value.lastError) {
          _push(`<div><p class="text-slate-400 text-sm">Last Outcome</p><p class="text-slate-300 text-sm mt-1">${ssrInterpolate(status.value.lastRunMessage)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
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
        _push(`<div class="flex gap-2">`);
        if (history.value.length > 0) {
          _push(`<button${ssrIncludeBooleanAttr(historyClearing.value) ? " disabled" : ""} class="px-3 py-1.5 text-sm bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition disabled:opacity-50">${ssrInterpolate(historyClearing.value ? "Clearing..." : "Clear")}</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button${ssrIncludeBooleanAttr(historyLoading.value) ? " disabled" : ""} class="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition disabled:opacity-50"> Refresh </button></div>`);
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
        ssrRenderList(history.value, (entry) => {
          _push(`<div class="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition"><div class="flex-1 min-w-0">`);
          if (entry.type === "transaction") {
            _push(`<!--[--><a${ssrRenderAttr("href", `https://basescan.org/tx/${entry.hash}`)} target="_blank" rel="noopener noreferrer" class="font-mono text-sm text-blue-400 hover:text-blue-300 truncate block">${ssrInterpolate(entry.hash.slice(0, 10))}...${ssrInterpolate(entry.hash.slice(-8))}</a><p class="text-slate-400 text-xs mt-1">${ssrInterpolate(formatDate(entry.timestamp))} \u2022 ${ssrInterpolate(entry.tokenIds.length)} petted `);
            if (entry.gasCostWei) {
              _push(`<span class="text-slate-500"> \u2022 ${ssrInterpolate(formatGasCost(Number(BigInt(entry.gasCostWei)) / 1e18))}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</p><!--]-->`);
          } else {
            _push(`<!--[--><p class="text-slate-200 text-sm font-medium truncate">${ssrInterpolate(entry.message)}</p><p class="text-slate-400 text-xs mt-1">${ssrInterpolate(formatDate(entry.timestamp))}${ssrInterpolate(entry.petted != null ? ` \u2022 ${entry.petted} petted` : "")}</p><!--]-->`);
          }
          _push(`</div><span class="${ssrRenderClass([entry.type === "manual" ? "text-amber-400" : "text-emerald-400", "text-xs font-medium ml-2"])}">${ssrInterpolate(entry.type === "manual" ? "Manual" : "Success")}</span></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div>`);
      if (isAuthenticated.value) {
        _push(`<div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6"><h2 class="text-lg font-semibold mb-2">Manual Pet</h2><p class="text-slate-400 text-sm mb-4"> Trigger a petting run now for all delegated gotchis. Skips the 12h cooldown. Use this to test the petter. </p><div class="flex flex-wrap gap-3"><button${ssrIncludeBooleanAttr(manualPetting.value) ? " disabled" : ""} class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">${ssrInterpolate(manualPetting.value ? "Petting..." : "Pet All Gotchis Now")}</button><button${ssrIncludeBooleanAttr(configCheckLoading.value) ? " disabled" : ""} class="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition disabled:opacity-50 text-sm">${ssrInterpolate(configCheckLoading.value ? "Checking..." : "Check config")}</button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (isAuthenticated.value) {
        _push(`<div class="grid md:grid-cols-2 gap-6 mt-6">`);
        _push(ssrRenderComponent(_component_BotControl, {
          onTriggered: () => {
            fetchHistory();
            fetchWorkerLogs();
          }
        }, null, _parent));
        _push(ssrRenderComponent(_component_DelegationCard, null, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (isAuthenticated.value) {
        _push(`<div class="mt-6"><div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6"><h2 class="text-lg font-semibold mb-4">Petting Timer</h2><p class="text-slate-400 text-sm mb-4"> How often the bot checks and pets your Aavegotchis. Gotchis need petting at least every 12 hours for kinship. </p><div class="flex flex-wrap items-center gap-4"><label class="flex items-center gap-2"><span class="text-slate-300 text-sm">Interval:</span><select${ssrRenderAttr("value", pettingIntervalHours.value)}${ssrIncludeBooleanAttr(frequencySaving.value || testModeCountdown.value != null) ? " disabled" : ""} class="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"><!--[-->`);
        ssrRenderList(hourOptions, (h) => {
          _push(`<option${ssrRenderAttr("value", h)}> Every ${ssrInterpolate(h)} ${ssrInterpolate(h === 1 ? "hour" : "hours")}</option>`);
        });
        _push(`<!--]--></select></label>`);
        if (frequencySaving.value) {
          _push(`<span class="text-slate-400 text-sm">Saving...</span>`);
        } else {
          _push(`<!---->`);
        }
        if (!testModeCountdown.value) {
          _push(`<button type="button"${ssrIncludeBooleanAttr(frequencySaving.value || manualPetting.value) ? " disabled" : ""} class="px-4 py-2 text-sm bg-amber-600/80 hover:bg-amber-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"> Test (1 min) </button>`);
        } else {
          _push(`<span class="text-amber-400 text-sm font-medium"> Reverting in ${ssrInterpolate(testModeCountdown.value)}s... </span>`);
        }
        _push(`</div><p class="text-slate-500 text-xs mt-3"> Test (1 min): Sets interval to 1 min, triggers a pet now, then reverts to 12h after 60 seconds. </p></div></div>`);
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
      if (isAuthenticated.value && workerEnabled.value) {
        _push(`<div class="mt-6"><div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6"><div class="flex items-center justify-between mb-4"><h2 class="text-lg font-semibold">Worker Logs</h2><button${ssrIncludeBooleanAttr(workerLogsLoading.value) ? " disabled" : ""} class="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition disabled:opacity-50">${ssrInterpolate(workerLogsLoading.value ? "Loading..." : "Refresh")}</button></div>`);
        if (workerLogsLoading.value && workerLogs.value.length === 0) {
          _push(`<div class="text-center py-8 text-slate-400"><p>Loading worker logs...</p></div>`);
        } else if (workerLogs.value.length === 0) {
          _push(`<div class="text-center py-8 text-slate-400"><p>No worker logs yet. Trigger a run to see logs.</p></div>`);
        } else {
          _push(`<div class="space-y-1.5 max-h-80 overflow-y-auto font-mono text-xs"><!--[-->`);
          ssrRenderList(workerLogs.value, (log, i) => {
            _push(`<div class="${ssrRenderClass([{
              "text-slate-300": log.level === "info",
              "text-amber-400": log.level === "warn",
              "text-red-400": log.level === "error"
            }, "flex items-start gap-2 py-1.5 px-2 rounded hover:bg-white/5"])}"><span class="text-slate-500 shrink-0">${ssrInterpolate(formatLogTime(log.timestamp))}</span><span class="${ssrRenderClass([{ "text-amber-400": log.level === "warn", "text-red-400": log.level === "error" }, "shrink-0 w-10"])}"> [${ssrInterpolate(log.level.toUpperCase())}] </span><span class="break-all">${ssrInterpolate(log.message)}</span></div>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`</div></div>`);
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

export { _sfc_main as default };
//# sourceMappingURL=index-DKS1KYXj.mjs.map
