import { addTransaction, addError, addWorkerLogs, getBotState, setBotState } from '~/lib/kv'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const reportSecret = config.reportSecret || process.env.REPORT_SECRET

  if (!reportSecret) {
    throw createError({
      statusCode: 500,
      message: 'Report secret not configured',
    })
  }

  const authHeader = getHeader(event, 'x-report-secret')
  if (authHeader !== reportSecret) {
    throw createError({
      statusCode: 401,
      message: 'Invalid report secret',
    })
  }

  const body = (await readBody(event)) as {
    success: boolean
    transactionHash?: string
    blockNumber?: number
    gasUsed?: string
    petted?: number
    tokenIds?: string[]
    message?: string
    error?: string
    logs?: { timestamp: number; level: string; message: string }[]
  } | undefined

  if (!body || typeof body !== 'object') {
    throw createError({
      statusCode: 400,
      message: 'Invalid request body',
    })
  }

  const state = await getBotState()

  if (body.success && body.transactionHash && body.blockNumber !== undefined) {
    await addTransaction({
      hash: body.transactionHash,
      timestamp: Date.now(),
      blockNumber: body.blockNumber,
      gasUsed: body.gasUsed || '0',
      tokenIds: body.tokenIds || [],
    })
    await setBotState({
      ...state!,
      running: true,
      lastRun: Date.now(),
      lastError: undefined,
      lastRunMessage: body.message,
    })
  } else if (!body.success && body.error) {
    await addError({
      id: Date.now().toString(),
      timestamp: Date.now(),
      message: body.error,
      type: 'CloudflareWorkerError',
    })
    await setBotState({
      ...state!,
      lastError: body.error,
      lastRunMessage: undefined,
    })
  } else {
    await setBotState({
      ...state!,
      lastRun: Date.now(),
      lastError: undefined,
      lastRunMessage: body.message,
    })
  }

  if (body.logs?.length) {
    const valid = body.logs.filter(
      (l) =>
        typeof l.timestamp === 'number' &&
        ['info', 'warn', 'error'].includes(l.level) &&
        typeof l.message === 'string'
    )
    if (valid.length) {
      await addWorkerLogs(valid as { timestamp: number; level: 'info' | 'warn' | 'error'; message: string }[])
    }
  }

  return { ok: true }
})
