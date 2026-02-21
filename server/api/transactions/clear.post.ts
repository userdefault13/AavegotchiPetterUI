import { getHeader } from 'h3'
import { checkAuth } from '~/lib/auth'
import { clearTransactions, clearManualTriggerLogs } from '~/lib/kv'

function checkClearAuth(event: { node?: { req?: { headers?: unknown } } }) {
  if (checkAuth(event)) return true
  const config = useRuntimeConfig()
  const secret = config.reportSecret || process.env.REPORT_SECRET
  if (!secret) return false
  const header = getHeader(event, 'x-report-secret')
  return header === secret
}

/**
 * Admin: Clear execution history (transactions + manual trigger logs).
 * Auth: session or X-Report-Secret.
 */
export default defineEventHandler(async (event) => {
  if (!checkClearAuth(event)) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  await Promise.all([clearTransactions(), clearManualTriggerLogs()])
  return { success: true, message: 'Execution history cleared' }
})
