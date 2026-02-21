<template>
  <div class="home-dashboard min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white p-4 md:p-8">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold tracking-tight">Aavegotchi Petter</h1>
          <p class="text-slate-400 mt-1">Automated petting on Base • {{ pettingIntervalLabel }}</p>
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
          <div class="flex items-center justify-between gap-2">
            <div>
              <p class="text-slate-400 text-sm">Gas Cost</p>
              <p class="text-xl font-bold mt-1 font-mono">{{ formatGasCost(stats.totalGasCostEth) }}</p>
            </div>
            <button
              v-if="isAuthenticated && formatGasCost(stats.totalGasCostEth) === '—'"
              @click="backfillGas"
              :disabled="backfillLoading"
              class="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded transition disabled:opacity-50 shrink-0"
            >
              {{ backfillLoading ? '...' : 'Look up' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Wallet & Auth Section -->
      <div v-if="isAuthenticated" class="grid md:grid-cols-2 gap-6">
        <!-- Petter Wallet Info -->
        <div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold">Petter Wallet</h2>
            <button
              @click="fetchPetterBalance"
              :disabled="balanceRefreshing"
              class="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded transition disabled:opacity-50"
            >
              {{ balanceRefreshing ? '...' : 'Refresh' }}
            </button>
          </div>
          <div class="space-y-3">
            <div>
              <p class="text-slate-400 text-sm">Address</p>
              <p class="font-mono text-sm break-all mt-1">{{ petterAddress || '—' }}</p>
            </div>
            <div>
              <p class="text-slate-400 text-sm">Balance (ETH)</p>
              <p class="font-mono text-lg font-bold mt-1">{{ petterBalance ?? '—' }}</p>
              <p v-if="petterBalanceAddress" class="text-slate-500 text-xs mt-0.5">
                from {{ petterBalanceAddress.slice(0, 10) }}...{{ petterBalanceAddress.slice(-8) }}
              </p>
            </div>
            <div>
              <p class="text-slate-400 text-sm">Gotchis Delegated</p>
              <p class="font-mono text-lg font-bold mt-1">{{ totalGotchisDelegated ?? '—' }}</p>
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
          <div v-if="isAuthenticated" class="flex gap-2">
            <button
              v-if="history.length > 0"
              @click="clearHistory"
              :disabled="historyClearing"
              class="px-3 py-1.5 text-sm bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition disabled:opacity-50"
            >
              {{ historyClearing ? 'Clearing...' : 'Clear' }}
            </button>
            <button
              @click="fetchHistory"
              :disabled="historyLoading"
              class="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
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

      <!-- Manual Pet -->
      <div v-if="isAuthenticated" class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
        <h2 class="text-lg font-semibold mb-2">Manual Pet</h2>
        <p class="text-slate-400 text-sm mb-4">
          Trigger a petting run now for all delegated gotchis. Skips the 12h cooldown. Use this to test the petter.
        </p>
        <button
          @click="manualPet"
          :disabled="manualPetting"
          class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ manualPetting ? 'Petting...' : 'Pet All Gotchis Now' }}
        </button>
      </div>

      <!-- Bot Control & Delegation -->
      <div v-if="isAuthenticated" class="grid md:grid-cols-2 gap-6 mt-6">
        <BotControl v-if="workerEnabled" @triggered="() => { fetchHistory(); fetchWorkerLogs(); }" />
        <DelegationCard />
      </div>

      <!-- Timer / Petting Frequency -->
      <div v-if="isAuthenticated" class="mt-6">
        <div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
          <h2 class="text-lg font-semibold mb-4">Petting Timer</h2>
          <p class="text-slate-400 text-sm mb-4">
            How often the bot checks and pets your Aavegotchis. Gotchis need petting at least every 12 hours for kinship.
          </p>
          <div class="flex flex-wrap items-center gap-4">
            <label class="flex items-center gap-2">
              <span class="text-slate-300 text-sm">Interval:</span>
              <select
                :value="pettingIntervalHours"
                :disabled="frequencySaving || testModeCountdown != null"
                @change="(e) => setFrequency(Number((e.target as HTMLSelectElement).value))"
                class="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
              >
                <option v-for="h in hourOptions" :key="h" :value="h">
                  Every {{ h }} {{ h === 1 ? 'hour' : 'hours' }}
                </option>
              </select>
            </label>
            <span v-if="frequencySaving" class="text-slate-400 text-sm">Saving...</span>
            <button
              v-if="!testModeCountdown"
              type="button"
              @click="runTestMode(60)"
              :disabled="frequencySaving || manualPetting"
              class="px-4 py-2 text-sm bg-amber-600/80 hover:bg-amber-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test (1 min)
            </button>
            <span v-else class="text-amber-400 text-sm font-medium">
              Reverting in {{ testModeCountdown }}s...
            </span>
          </div>
          <p class="text-slate-500 text-xs mt-3">
            Test (1 min): Sets interval to 1 min, triggers a pet now, then reverts to 12h after 60 seconds.
          </p>
        </div>
      </div>

      <!-- Delegating Owners -->
      <div v-if="isAuthenticated" class="mt-6">
        <DelegationList />
      </div>

      <!-- Worker Logs -->
      <div v-if="isAuthenticated && workerEnabled" class="mt-6">
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { disconnect } from '@wagmi/core'
import { wagmiConfig } from '~/lib/wagmi'

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

const config = useRuntimeConfig()
const workerEnabled = computed(() => config.public.workerEnabled === true)
const health = ref<HealthData | null>(null)
const history = ref<ExecutionEntry[]>([])
const { status: delegationStatus, fetchStatus: fetchDelegation, petterAddress } = useDelegationStatus()
const petterBalance = ref<string | null>(null)
const petterBalanceAddress = ref<string | null>(null)
const balanceRefreshing = ref(false)
const totalGotchisDelegated = ref<number | null>(null)
const workerLogs = ref<{ timestamp: number; level: string; message: string }[]>([])
const pettingIntervalHours = ref(12)
const frequencySaving = ref(false)
const testModeCountdown = ref<number | null>(null)
let testModeIntervalId: ReturnType<typeof setInterval> | null = null
const loading = ref(true)
const historyLoading = ref(false)
const historyClearing = ref(false)
const manualPetting = ref(false)
const workerLogsLoading = ref(false)
const backfillLoading = ref(false)
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
  const intervalMs = pettingIntervalHours.value * 60 * 60 * 1000
  const nextRunMs = lastRunMs + intervalMs
  const now = Date.now()
  if (now >= nextRunMs) return 'Ready'
  const diff = nextRunMs - now
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return `${h}h ${m}m`
})

const hourOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]

const pettingIntervalLabel = computed(() => {
  const h = pettingIntervalHours.value
  if (h < 1 / 60) return `Every ${Math.round(h * 3600)} sec (test)`
  if (h < 1) return `Every ${Math.round(h * 60)} min`
  return `Every ${h} ${h === 1 ? 'hour' : 'hours'}`
})

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

const clearHistory = async () => {
  if (!isAuthenticated.value || !confirm('Clear all execution history? This cannot be undone.')) return
  historyClearing.value = true
  try {
    await $fetch('/api/transactions/clear', { method: 'POST' })
    history.value = []
    await fetchHealth()
  } catch (err) {
    console.error('Failed to clear history:', err)
    alert('Failed to clear execution history')
  } finally {
    historyClearing.value = false
  }
}

const manualPet = async () => {
  if (!isAuthenticated.value) return
  manualPetting.value = true
  try {
    const res = await $fetch<{ success: boolean; result?: { message?: string; petted?: number } }>('/api/bot/trigger', {
      method: 'POST',
      body: { force: true },
    })
    const msg = res?.result?.message
    alert(msg || 'Petting completed!')
    await fetchHistory()
    await fetchHealth()
    if (workerEnabled.value) await fetchWorkerLogs()
  } catch (err: unknown) {
    console.error('Manual pet failed:', err)
    const msg = extractErrorMessage(err, 'Failed to trigger petting')
    alert(msg)
  } finally {
    manualPetting.value = false
  }
}

const backfillGas = async () => {
  if (!isAuthenticated.value) return
  backfillLoading.value = true
  try {
    const res = await $fetch<{ ok: boolean; updated: number }>('/api/transactions/backfill-gas', {
      method: 'POST',
    })
    if (res.ok && res.updated > 0) {
      await fetchHealth()
      await fetchHistory()
    }
  } catch (err) {
    console.error('Backfill gas failed:', err)
  } finally {
    backfillLoading.value = false
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

const fetchFrequency = async () => {
  if (!isAuthenticated.value) return
  try {
    const data = await $fetch<{ pettingIntervalHours: number }>('/api/bot/frequency')
    pettingIntervalHours.value = data.pettingIntervalHours
  } catch {
    pettingIntervalHours.value = 12
  }
}

const setFrequency = async (hours: number) => {
  if (!isAuthenticated.value) return
  if (hours < 30 / 3600 || hours > 24) return
  frequencySaving.value = true
  try {
    await $fetch('/api/bot/frequency', {
      method: 'POST',
      body: { pettingIntervalHours: hours },
    })
    pettingIntervalHours.value = hours
  } catch (err) {
    console.error('Failed to set frequency:', err)
    alert('Failed to update petting frequency')
  } finally {
    frequencySaving.value = false
  }
}

const runTestMode = async (durationSec: number) => {
  if (!isAuthenticated.value || frequencySaving.value || testModeCountdown.value != null || manualPetting.value) return
  frequencySaving.value = true
  const intervalHours = durationSec / 3600
  const defaultHours = 12
  try {
    await $fetch('/api/bot/frequency', {
      method: 'POST',
      body: { pettingIntervalHours: intervalHours },
    })
    pettingIntervalHours.value = intervalHours
    testModeCountdown.value = durationSec

    // Immediately trigger a pet
    try {
      const res = await $fetch<{ success: boolean; result?: { message?: string; petted?: number } }>('/api/bot/trigger', {
        method: 'POST',
        body: { force: true },
      })
      const msg = res?.result?.message
      if (msg) alert(msg)
      await fetchHistory()
      await fetchHealth()
      if (workerEnabled.value) await fetchWorkerLogs()
    } catch (err) {
      console.error('Test pet failed:', err)
      const msg = extractErrorMessage(err, 'Pet failed')
      alert(msg)
    }

    if (testModeIntervalId) clearInterval(testModeIntervalId)
    testModeIntervalId = setInterval(() => {
      if (testModeCountdown.value == null) return
      testModeCountdown.value -= 1
      if (testModeCountdown.value <= 0) {
        if (testModeIntervalId) clearInterval(testModeIntervalId)
        testModeIntervalId = null
        testModeCountdown.value = null
        setFrequency(defaultHours)
      }
    }, 1000)
  } catch (err) {
    console.error('Failed to start test mode:', err)
    alert('Failed to start test mode')
  } finally {
    frequencySaving.value = false
  }
}


const fetchPetterBalance = async () => {
  balanceRefreshing.value = true
  try {
    const res = await $fetch<{ balance: string; balanceAddress: string | null }>('/api/petter-balance')
    petterBalance.value = res.balance
    petterBalanceAddress.value = res.balanceAddress
  } catch (err) {
    petterBalance.value = '—'
    petterBalanceAddress.value = null
  } finally {
    balanceRefreshing.value = false
  }
}

const fetchDelegationOwners = async () => {
  try {
    const res = await $fetch<{ owners: { address: string; gotchiCount: number }[]; totalGotchis: number }>(
      '/api/delegation/owners'
    )
    totalGotchisDelegated.value = res.totalGotchis ?? 0
  } catch {
    totalGotchisDelegated.value = null
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
    isAuthenticated.value = false
    window.location.href = '/'
  } catch (err) {
    console.error('Failed to logout:', err)
    isAuthenticated.value = false
    window.location.href = '/'
  }
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (!err) return fallback
  const e = err as { data?: { message?: string; error?: string }; statusMessage?: string; message?: string }
  const msg = e?.data?.message ?? e?.data?.error ?? e?.statusMessage ?? e?.message
  if (typeof msg === 'string' && msg.length > 0) return msg
  if (err instanceof Error && err.message) return err.message
  return fallback
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

onUnmounted(() => {
  if (testModeIntervalId) clearInterval(testModeIntervalId)
})

onMounted(async () => {
  await checkAuth()
  await fetchHealth()
  if (isAuthenticated.value) {
    const tasks = [
      fetchHistory(),
      fetchDelegation(),
      fetchPetterBalance(),
      fetchDelegationOwners(),
      fetchFrequency(),
    ]
    if (workerEnabled.value) {
      tasks.push(fetchWorkerLogs())
    }
    await Promise.all(tasks)
  }
  loading.value = false
  setInterval(fetchHealth, 30000)
  if (isAuthenticated.value) {
    setInterval(
      () => {
        const tasks = [fetchHistory(), fetchPetterBalance(), fetchDelegationOwners(), fetchFrequency()]
        if (workerEnabled.value) {
          tasks.push(fetchWorkerLogs())
        }
        return Promise.all(tasks)
      },
      60000
    )
  }
})
</script>
