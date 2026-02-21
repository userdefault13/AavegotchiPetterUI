import { proxyToPetter } from '~/server/utils/petterProxy'
import { checkAuth } from '~/lib/auth'

/** Health: if authenticated, proxy to Petter /api/health. Else return basic ok. */
export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'aavegotchi-petter-dashboard',
      message: 'Login for full health stats',
    }
  }
  return proxyToPetter(event, '/api/health', { method: 'GET' })
})
