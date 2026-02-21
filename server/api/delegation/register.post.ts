import { getCookie } from 'h3'
import { proxyToPetter } from '~/server/utils/petterProxy'
import { checkAuth } from '~/lib/auth'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const session = getCookie(event, 'auth_session') as string | undefined
  if (!session) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }

  return proxyToPetter(event, '/api/delegation/register', {
    method: 'POST',
    body: { ownerAddress: session },
  })
})
