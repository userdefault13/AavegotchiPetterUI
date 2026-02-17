import { getCookie } from 'h3'
import { removeDelegatedOwner, checkAuth } from '~/lib'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const session = getCookie(event, 'auth_session') as string | undefined
  if (!session) {
    throw createError({
      statusCode: 401,
      message: 'Not authenticated',
    })
  }

  const ownerAddress = session.toLowerCase()
  await removeDelegatedOwner(ownerAddress)

  return {
    success: true,
    message: 'Unregistered from auto-petting. Revoke on-chain to fully remove the petter.',
  }
})
