import { checkAuth } from '~/lib/auth'
import { clearAllDelegatedOwners } from '~/lib/kv'

/**
 * Admin: Unregister all delegates. Clears the delegated owners list so the worker
 * stops petting for them until they re-register with the new petter.
 * Does NOT revoke on-chain - each owner must call setPetOperatorForAll(petter, false) themselves.
 */
export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const config = useRuntimeConfig()
  const petterAddress = config.petterAddress || process.env.PETTER_ADDRESS || ''

  const count = await clearAllDelegatedOwners()
  const revokeHint = petterAddress
    ? `Each owner should revoke on-chain: setPetOperatorForAll(${petterAddress}, false)`
    : 'Each owner should revoke the petter on-chain.'
  return {
    success: true,
    message: `Unregistered ${count} delegate(s). ${revokeHint}`,
    count,
  }
})
