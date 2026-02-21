import { getHeader } from 'h3'
import { proxyToPetter, getPetterSecret } from '~/server/utils/petterProxy'

/** Used by AarcadeGh-t / external - auth via X-Report-Secret. */
export default defineEventHandler(async (event) => {
  const secret = getPetterSecret()
  const header = getHeader(event, 'x-report-secret')
  if (!secret || header !== secret) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  return proxyToPetter(event, '/api/delegated-owners', { method: 'GET' })
})
