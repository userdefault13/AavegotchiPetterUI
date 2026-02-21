import { getHeader } from 'h3'
import { getPettingIntervalHours, getBotState } from '~/lib/kv'

/**
 * Returns the dashboard's Base RPC URL, petting interval, and running status for the worker.
 * Worker must respect running=false (bot stopped) and skip petting.
 */
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
      message: 'Unauthorized',
    })
  }

  const baseRpcUrl = config.baseRpcUrl || process.env.BASE_RPC_URL || 'https://mainnet.base.org'
  const pettingIntervalHours = await getPettingIntervalHours()
  const botState = await getBotState()
  return { baseRpcUrl, pettingIntervalHours, running: botState?.running ?? false }
})
