import { getCookie } from 'h3'
import { isDelegatedOwner, checkAuth } from '~/lib'
import { ensureRawAddress } from '~/lib/address'

/** Returns whether the authenticated user is registered for auto-petting. Client-side reads handle contract data. */
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

  try {
    const ownerAddress = ensureRawAddress(session)
    const registered = await isDelegatedOwner(ownerAddress)
    return { registered }
  } catch (addrErr: any) {
    throw createError({
      statusCode: 400,
      message: addrErr?.message || 'Invalid address format',
    })
  }
})
