import { kv } from '@vercel/kv'

export interface Transaction {
  hash: string
  timestamp: number
  blockNumber: number
  gasUsed: string
  gasCostWei?: string
  tokenIds: string[]
}

export interface ErrorLog {
  id: string
  timestamp: number
  message: string
  stack?: string
  type: string
}

export interface WorkerLogEntry {
  timestamp: number
  level: 'info' | 'warn' | 'error'
  message: string
}

export async function addWorkerLogs(entries: WorkerLogEntry[]): Promise<void> {
  if (!entries.length) return
  for (const e of entries) {
    await kv.lpush('worker_logs', e)
  }
  await kv.ltrim('worker_logs', 0, 199)
}

export async function getWorkerLogs(limit = 100): Promise<WorkerLogEntry[]> {
  try {
    const logs = await kv.lrange<WorkerLogEntry>('worker_logs', 0, limit - 1)
    return logs || []
  } catch {
    return []
  }
}

export interface BotState {
  running: boolean
  lastRun?: number
  lastError?: string
  lastRunMessage?: string
}

export async function getBotState(): Promise<BotState | null> {
  try {
    const state = await kv.get<BotState>('bot:state')
    return state || { running: false }
  } catch {
    return { running: false }
  }
}

export async function setBotState(state: BotState): Promise<void> {
  await kv.set('bot:state', state)
}

export async function addTransaction(transaction: Transaction): Promise<void> {
  await kv.lpush('transactions', transaction)
  await kv.ltrim('transactions', 0, 99)
}

export async function getTransactions(limit = 50): Promise<Transaction[]> {
  try {
    const transactions = await kv.lrange<Transaction>('transactions', 0, limit - 1)
    return transactions || []
  } catch {
    return []
  }
}

/** Clear all transactions (execution history) */
export async function clearTransactions(): Promise<void> {
  await kv.del('transactions')
}

/** Replace the entire transactions list (used for backfilling gas cost) */
export async function setTransactions(transactions: Transaction[]): Promise<void> {
  await kv.del('transactions')
  if (transactions.length === 0) return
  const ordered = [...transactions].reverse()
  await kv.lpush('transactions', ...ordered)
  await kv.ltrim('transactions', 0, 99)
}

export async function getTransaction(hash: string): Promise<Transaction | null> {
  const transactions = await getTransactions(100)
  return transactions.find((t) => t.hash === hash) || null
}

export interface ManualTriggerLog {
  id: string
  timestamp: number
  message: string
  petted?: number
}

export async function addManualTriggerLog(log: ManualTriggerLog): Promise<void> {
  await kv.lpush('manual_triggers', log)
  await kv.ltrim('manual_triggers', 0, 99)
}

export async function getManualTriggerLogs(limit = 50): Promise<ManualTriggerLog[]> {
  try {
    const logs = await kv.lrange<ManualTriggerLog>('manual_triggers', 0, limit - 1)
    return logs || []
  } catch {
    return []
  }
}

/** Clear manual trigger logs (execution history) */
export async function clearManualTriggerLogs(): Promise<void> {
  await kv.del('manual_triggers')
}

export async function addError(error: ErrorLog): Promise<void> {
  await kv.lpush('errors', error)
  await kv.ltrim('errors', 0, 99)
}

export async function getErrors(limit = 50): Promise<ErrorLog[]> {
  try {
    const errors = await kv.lrange<ErrorLog>('errors', 0, limit - 1)
    return errors || []
  } catch {
    return []
  }
}

export async function clearErrors(): Promise<void> {
  await kv.del('errors')
}

export async function getDelegatedOwners(): Promise<string[]> {
  try {
    const owners = await kv.get<string[]>('delegated:owners')
    return owners || []
  } catch {
    return []
  }
}

export async function addDelegatedOwner(owner: string): Promise<void> {
  if (!owner || typeof owner !== 'string') return
  const normalized = owner.toLowerCase()
  const owners = await getDelegatedOwners()
  if (!owners.includes(normalized)) {
    owners.push(normalized)
    await kv.set('delegated:owners', owners)
  }
}

export async function removeDelegatedOwner(owner: string): Promise<void> {
  if (!owner || typeof owner !== 'string') return
  const normalized = owner.toLowerCase()
  const owners = await getDelegatedOwners()
  const filtered = owners.filter((o) => o !== normalized)
  if (filtered.length !== owners.length) {
    await kv.set('delegated:owners', filtered)
  }
}

export async function clearAllDelegatedOwners(): Promise<number> {
  const owners = await getDelegatedOwners()
  await kv.set('delegated:owners', [])
  return owners.length
}

export async function isDelegatedOwner(owner: string): Promise<boolean> {
  if (!owner || typeof owner !== 'string') return false
  const owners = await getDelegatedOwners()
  return owners.includes(owner.toLowerCase())
}

/** Petting interval in hours (min ~30 sec, max 24). Default 12. */
const PETTING_INTERVAL_KEY = 'bot:petting_interval_hours'
const DEFAULT_PETTING_INTERVAL = 12
const MIN_INTERVAL_HOURS = 30 / 3600 // 30 seconds

export async function getPettingIntervalHours(): Promise<number> {
  try {
    const val = await kv.get<number>(PETTING_INTERVAL_KEY)
    if (typeof val === 'number' && val >= MIN_INTERVAL_HOURS && val <= 24) return val
  } catch {
    /* ignore */
  }
  return DEFAULT_PETTING_INTERVAL
}

export async function setPettingIntervalHours(hours: number): Promise<void> {
  const clamped = Math.max(MIN_INTERVAL_HOURS, Math.min(24, hours))
  await kv.set(PETTING_INTERVAL_KEY, clamped)
}
