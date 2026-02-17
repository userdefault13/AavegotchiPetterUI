import { getHeader } from 'h3'

/**
 * Returns the dashboard's Base RPC URL for the worker to use.
 * Ensures worker and dashboard use the same RPC (dashboard shows 22 gotchis, worker should too).
 */
export default defineEventHandler((event) => {
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
  return { baseRpcUrl }
})
