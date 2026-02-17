<template>
  <div class="home-dashboard min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white p-4 md:p-8">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold tracking-tight">Aavegotchi Petter</h1>
          <p class="text-slate-400 mt-1">Automated petting on Base • Every 12 hours</p>
        </div>
        <div class="flex items-center gap-3">
          <div
            class="flex items-center gap-2 px-4 py-2 rounded-lg"
            :class="status.running ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-amber-500/20 border border-amber-500/50'"
          >
            <div class="w-2 h-2 rounded-full animate-pulse" :class="status.running ? 'bg-emerald-400' : 'bg-amber-400'" />
            <span class="text-sm font-medium">{{ status.running ? 'Running' : 'Stopped' }}</span>
          </div>
          <button
            v-if="isAuthenticated"
            @click="logout"
            class="px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded-lg text-sm font-medium transition"
          >
            Logout
          </button>
          <WalletConnect v-else />
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4">
          <p class="text-slate-400 text-sm">Next Pet</p>
          <p class="text-xl font-bold mt-1 font-mono">{{ nextPetTimer }}</p>
        </div>
        <div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4">
          <p class="text-slate-400 text-sm">Total Petted</p>
          <p class="text-xl font-bold mt-1">{{ stats.totalAavegotchisPetted ?? 0 }}</p>
        </div>
        <div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4">
          <p class="text-slate-400 text-sm">Success Rate</p>
          <p class="text-xl font-bold mt-1" :class="successRateColor">{{ stats.successRate ?? 100 }}%</p>
        </div>
        <div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4">
          <p class="text-slate-400 text-sm">Last 24h</p>
          <p class="text-xl font-bold mt-1">{{ stats.transactionsLast24h ?? 0 }}</p>
        </div>
        <div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4">
          <p class="text-slate-400 text-sm">Gas Cost</p>
          <p class="text-xl font-bold mt-1 font-mono">{{ formatGasCost(stats.totalGasCostEth) }}</p>
        </div>
      </div>

      <!-- Wallet & Auth Section -->
      <div v-if="isAuthenticated" class="grid md:grid-cols-2 gap-6">
        <!-- Wallet Info -->
        <div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
          <h2 class="text-lg font-semibold mb-4">Wallet</h2>
          <div class="space-y-3">
            <div>
              <p class="text-slate-400 text-sm">Address</p>
              <p class="font-mono text-sm break-all mt-1">{{ walletAddress || '—' }}</p>
            </div>
            <div>
              <p class="text-slate-400 text-sm">Balance (ETH)</p>
              <p class="font-mono text-lg font-bold mt-1">{{ walletBalance ?? '—' }}</p>
            </div>
            <div>
              <p class="text-slate-400 text-sm">Gotchis Delegated</p>
              <p class="font-mono text-lg font-bold mt-1">{{ delegationStatus?.gotchiCount ?? '—' }}</p>
            </div>
          </div>
        </div>

        <!-- Last Run -->
        <div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
          <h2 class="text-lg font-semibold mb-4">Bot Status</h2>
          <div class="space-y-3">
            <div>
              <p class="text-slate-400 text-sm">Last Run</p>
              <p class="mt-1">{{ formatDate(status.lastRun) }}</p>
            </div>
            <div v-if="status.lastRunMessage && !status.lastError">
              <p class="text-slate-400 text-sm">Last Outcome</p>
              <p class="text-slate-300 text-sm mt-1">{{ status.lastRunMessage }}</p>
            </div>
            <div v-if="status.lastError">
              <p class="text-slate-400 text-sm">Last Error</p>
              <p class="text-red-400 text-sm mt-1 truncate">{{ status.lastError }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- History Log -->
      <div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">Execution History</h2>
          <button
            v-if="isAuthenticated"
            @click="fetchHistory"
            :disabled="historyLoading"
            class="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
        <div v-if="!isAuthenticated" class="text-center py-12 text-slate-400">
          <p>Connect wallet to view execution history</p>
        </div>
        <div v-else-if="historyLoading" class="text-center py-12 text-slate-400">
          <p>Loading...</p>
        </div>
        <div v-else-if="history.length === 0" class="text-center py-12 text-slate-400">
          <p>No executions yet</p>
        </div>
        <div v-else class="space-y-3 max-h-64 overflow-y-auto">
          <div
            v-for="entry in history"
            :key="entry.type === 'transaction' ? entry.hash : entry.id"
            class="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition"
          >
            <div class="flex-1 min-w-0">
              <template v-if="entry.type === 'transaction'">
                <a
                  :href="`https://basescan.org/tx/${entry.hash}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="font-mono text-sm text-blue-400 hover:text-blue-300 truncate block"
                >
                  {{ entry.hash.slice(0, 10) }}...{{ entry.hash.slice(-8) }}
                </a>
                <p class="text-slate-400 text-xs mt-1">
                  {{ formatDate(entry.timestamp) }} • {{ entry.tokenIds.length }} petted
                  <span v-if="entry.gasCostWei" class="text-slate-500"> • {{ formatGasCost(Number(BigInt(entry.gasCostWei)) / 1e18) }}</span>
                </p>
              </template>
              <template v-else>
                <p class="text-slate-200 text-sm font-medium truncate">{{ entry.message }}</p>
                <p class="text-slate-400 text-xs mt-1">{{ formatDate(entry.timestamp) }}{{ entry.petted != null ? ` • ${entry.petted} petted` : '' }}</p>
              </template>
            </div>
            <span
              class="text-xs font-medium ml-2"
              :class="entry.type === 'manual' ? 'text-amber-400' : 'text-emerald-400'"
            >
              {{ entry.type === 'manual' ? 'Manual' : 'Success' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Bot Control & Delegation -->
      <div v-if="isAuthenticated" class="grid md:grid-cols-2 gap-6 mt-6">
        <BotControl @triggered="() => { fetchHistory(); fetchWorkerLogs(); }" />
        <DelegationCard />
      </div>

      <!-- Delegating Owners -->
      <div v-if="isAuthenticated" class="mt-6">
        <DelegationList />
      </div>

      <!-- Worker Logs -->
      <div v-if="isAuthenticated" class="mt-6">
        <div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold">Worker Logs</h2>
            <button
              @click="fetchWorkerLogs"
              :disabled="workerLogsLoading"
              class="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition disabled:opacity-50"
            >
              {{ workerLogsLoading ? 'Loading...' : 'Refresh' }}
            </button>
          </div>
          <div v-if="workerLogsLoading && workerLogs.length === 0" class="text-center py-8 text-slate-400">
            <p>Loading worker logs...</p>
          </div>
          <div v-else-if="workerLogs.length === 0" class="text-center py-8 text-slate-400">
            <p>No worker logs yet. Trigger a run to see logs.</p>
          </div>
          <div v-else class="space-y-1.5 max-h-80 overflow-y-auto font-mono text-xs">
            <div
              v-for="(log, i) in workerLogs"
              :key="`${log.timestamp}-${i}`"
              class="flex items-start gap-2 py-1.5 px-2 rounded hover:bg-white/5"
              :class="{
                'text-slate-300': log.level === 'info',
                'text-amber-400': log.level === 'warn',
                'text-red-400': log.level === 'error',
              }"
            >
              <span class="text-slate-500 shrink-0">{{ formatLogTime(log.timestamp) }}</span>
              <span class="shrink-0 w-10" :class="{ 'text-amber-400': log.level === 'warn', 'text-red-400': log.level === 'error' }">
                [{{ log.level.toUpperCase() }}]
              </span>
              <span class="break-all">{{ log.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { disconnect } from '@wagmi/core'
import { wagmiConfig } from '~/lib/wagmi'
import { formatEther } from 'viem'
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

interface HealthData {
  status: string
  bot: { running: boolean; lastRun: string | null; lastError: string | null; lastRunMessage?: string | null }
  stats: {
    totalTransactions: number
    totalAavegotchisPetted: number
    transactionsLast24h: number
    totalGasCostEth?: number
    successRate: number
  }
}

type ExecutionEntry =
  | { type: 'transaction'; hash: string; timestamp: number; blockNumber: number; gasUsed: string; gasCostWei?: string; tokenIds: string[] }
  | { type: 'manual'; id: string; timestamp: number; message: string; petted?: number }

interface DelegationStatus {
  approved: boolean
  registered: boolean
  gotchiCount: number
}

const health = ref<HealthData | null>(null)
const history = ref<ExecutionEntry[]>([])
const delegationStatus = ref<DelegationStatus | null>(null)
const walletBalance = ref<string | null>(null)
const workerLogs = ref<{ timestamp: number; level: string; message: string }[]>([])
const loading = ref(true)
const historyLoading = ref(false)
const workerLogsLoading = ref(false)
const isAuthenticated = ref(false)

const status = computed(() => ({
  running: health.value?.bot?.running ?? false,
  lastRun: health.value?.bot?.lastRun ?? null,
  lastError: health.value?.bot?.lastError ?? null,
  lastRunMessage: health.value?.bot?.lastRunMessage ?? null,
}))

const stats = computed(() => health.value?.stats ?? { successRate: 100 })

const nextPetTimer = computed(() => {
  const lastRun = health.value?.bot?.lastRun
  if (!lastRun) return '—'
  const lastRunMs = new Date(lastRun).getTime()
  const nextRunMs = lastRunMs + 12 * 60 * 60 * 1000
  const now = Date.now()
  if (now >= nextRunMs) return 'Ready'
  const diff = nextRunMs - now
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return `${h}h ${m}m`
})

const walletAddress = ref<string | null>(null)

const successRateColor = computed(() => {
  const rate = stats.value?.successRate ?? 100
  if (rate >= 95) return 'text-emerald-400'
  if (rate >= 80) return 'text-amber-400'
  return 'text-red-400'
})

const fetchHealth = async () => {
  try {
    const data = await $fetch<HealthData>('/api/health')
    health.value = data
  } catch (err) {
    console.error('Failed to fetch health:', err)
  }
}

const fetchHistory = async () => {
  if (!isAuthenticated.value) return
  historyLoading.value = true
  try {
    const data = await $fetch<ExecutionEntry[]>('/api/transactions', { query: { limit: 20 } })
    history.value = data
  } catch (err) {
    console.error('Failed to fetch history:', err)
  } finally {
    historyLoading.value = false
  }
}

const fetchWorkerLogs = async () => {
  if (!isAuthenticated.value) return
  workerLogsLoading.value = true
  try {
    const data = await $fetch<{ timestamp: number; level: string; message: string }[]>('/api/bot/logs', {
      query: { limit: 100 },
    })
    workerLogs.value = data
  } catch (err) {
    console.error('Failed to fetch worker logs:', err)
    workerLogs.value = []
  } finally {
    workerLogsLoading.value = false
  }
}

const fetchDelegation = async () => {
  try {
    const data = await $fetch<DelegationStatus>('/api/delegation/status')
    delegationStatus.value = data
  } catch (err) {
    delegationStatus.value = null
  }
}

const fetchMe = async () => {
  try {
    const res = await $fetch<{ address: string | null }>('/api/auth/me')
    walletAddress.value = res.address
  } catch {
    walletAddress.value = null
  }
}

const fetchBalance = async () => {
  const addr = walletAddress.value
  if (!addr) return
  try {
    const client = createPublicClient({
      chain: base,
      transport: http(),
    })
    const balance = await client.getBalance({ address: addr as `0x${string}` })
    walletBalance.value = parseFloat(formatEther(balance)).toFixed(4)
  } catch (err) {
    walletBalance.value = '—'
  }
}

const checkAuth = async () => {
  try {
    const res = await $fetch<{ authenticated: boolean }>('/api/auth/check')
    isAuthenticated.value = res.authenticated
  } catch {
    isAuthenticated.value = false
  }
}

const logout = async () => {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    await disconnect(wagmiConfig)
    await navigateTo('/')
  } catch (err) {
    console.error('Failed to logout:', err)
  }
}

const formatDate = (val: string | number | undefined) => {
  if (!val) return '—'
  const ts = typeof val === 'string' ? new Date(val).getTime() : val
  return new Date(ts).toLocaleString()
}

const formatLogTime = (ts: number) => {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const formatGasCost = (eth: number | undefined) => {
  if (eth == null || eth === 0) return '—'
  if (eth < 0.0001) return '<0.0001 ETH'
  return `${eth.toFixed(4)} ETH`
}

onMounted(async () => {
  await checkAuth()
  await fetchHealth()
  if (isAuthenticated.value) {
    await fetchMe()
    await Promise.all([fetchHistory(), fetchDelegation(), fetchBalance(), fetchWorkerLogs()])
  }
  loading.value = false
  setInterval(fetchHealth, 30000)
  if (isAuthenticated.value) {
    setInterval(
      () => Promise.all([fetchMe(), fetchHistory(), fetchBalance(), fetchWorkerLogs()]),
      60000
    )
  }
})
</script>
