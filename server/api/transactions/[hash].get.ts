import { getRouterParam } from 'h3'
import { proxyToPetter } from '~/server/utils/petterProxy'
import { checkAuth } from '~/lib/auth'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  const hash = getRouterParam(event, 'hash')
  if (!hash) {
    throw createError({ statusCode: 400, message: 'Transaction hash required' })
  }
  return proxyToPetter(event, `/api/transactions/${hash}`, { method: 'GET' })
})
