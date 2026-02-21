import { getHeader } from 'h3'
import { proxyToPetter, getPetterSecret } from '~/server/utils/petterProxy'

/** Used by external cron - auth via X-Report-Secret. Must match PETTER_API_SECRET. */
export default defineEventHandler(async (event) => {
  const secret = getPetterSecret()
  const header = getHeader(event, 'x-report-secret')
  if (!secret || header !== secret) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  return proxyToPetter(event, '/api/bot/config', { method: 'GET' })
})
