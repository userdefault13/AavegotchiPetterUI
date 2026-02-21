import { getHeader } from 'h3'
import { checkAuth } from '~/lib/auth'
import { clearAllDelegatedOwners } from '~/lib/kv'

function checkClearAuth(event: { node?: { req?: { headers?: unknown } } }) {
  if (checkAuth(event)) return true
  const config = useRuntimeConfig()
  const secret = config.reportSecret || process.env.REPORT_SECRET
  if (!secret) return false
  const header = getHeader(event, 'x-report-secret')
  return header === secret
}

/**
 * Admin: Unregister all delegates. Clears delegated:owners in KV so owners must
 * re-register with the new petter. Auth: session or X-Report-Secret.
 * Does NOT revoke on-chain - each owner must call setPetOperatorForAll(petter, false) themselves.
 */
export default defineEventHandler(async (event) => {
  if (!checkClearAuth(event)) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const config = useRuntimeConfig()
  const petterAddress = config.petterAddress || process.env.PETTER_ADDRESS || '0x9a3E95f448f3daB367dd9213D4554444faa272F1'

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
