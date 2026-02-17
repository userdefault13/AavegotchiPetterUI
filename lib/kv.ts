import { kv } from '@vercel/kv'

export interface Transaction {
  hash: string
  timestamp: number
  blockNumber: number
  gasUsed: string
  tokenIds: string[]
}

export interface ErrorLog {
  id: string
  timestamp: number
  message: string
  stack?: string
  type: string
}

export interface BotState {
  running: boolean
  lastRun?: number
  lastError?: string
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

export async function getTransaction(hash: string): Promise<Transaction | null> {
  const transactions = await getTransactions(100)
  return transactions.find((t) => t.hash === hash) || null
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
  const normalized = owner.toLowerCase()
  const owners = await getDelegatedOwners()
  if (!owners.includes(normalized)) {
    owners.push(normalized)
    await kv.set('delegated:owners', owners)
  }
}

export async function isDelegatedOwner(owner: string): Promise<boolean> {
  const owners = await getDelegatedOwners()
  return owners.includes(owner.toLowerCase())
}
