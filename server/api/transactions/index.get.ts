import { getTransactions, getManualTriggerLogs, checkAuth } from '~/lib'

export type ExecutionEntry =
  | { type: 'transaction'; hash: string; timestamp: number; blockNumber: number; gasUsed: string; tokenIds: string[] }
  | { type: 'manual'; id: string; timestamp: number; message: string; petted?: number }

export default defineEventHandler(async (event): Promise<ExecutionEntry[]> => {
  if (!checkAuth(event)) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const query = getQuery(event)
  const limit = query.limit ? parseInt(query.limit as string) : 50

  const [transactions, manualLogs] = await Promise.all([
    getTransactions(limit),
    getManualTriggerLogs(limit),
  ])

  const entries: ExecutionEntry[] = [
    ...transactions.map((t) => ({
      type: 'transaction' as const,
      hash: t.hash,
      timestamp: t.timestamp,
      blockNumber: t.blockNumber,
      gasUsed: t.gasUsed,
      tokenIds: t.tokenIds,
    })),
    ...manualLogs.map((m) => ({
      type: 'manual' as const,
      id: m.id,
      timestamp: m.timestamp,
      message: m.message,
      petted: m.petted,
    })),
  ]

  entries.sort((a, b) => b.timestamp - a.timestamp)
  return entries.slice(0, limit)
})
