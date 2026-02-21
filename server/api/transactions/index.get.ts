import { proxyToPetter } from '~/server/utils/petterProxy'
import { checkAuth } from '~/lib/auth'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  return proxyToPetter(event, '/api/transactions', { method: 'GET' })
})
