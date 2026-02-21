/**
 * GET /api/bot/trigger - Diagnostic endpoint.
 * Returns config status (no secrets) to debug trigger failures.
 * Requires auth.
 */
import { checkAuth } from '~/lib/auth'
import { getPetterBaseUrl, getPetterSecret } from '~/server/utils/petterProxy'

export default defineEventHandler(async (event) => {
  const authenticated = checkAuth(event)
  if (!authenticated) {
    return { success: false, error: 'Unauthorized', hint: 'Connect wallet and sign in first' }
  }

  const config = useRuntimeConfig()
  const petterUrl = getPetterBaseUrl()
  const hasSecret = !!getPetterSecret()

  let petterOk = false
  try {
    const res = await fetch(`${petterUrl}/api/bot/status`, {
      headers: { 'X-Report-Secret': getPetterSecret() },
    })
    petterOk = res.ok
  } catch {
    petterOk = false
  }

  const issues: string[] = []
  if (!hasSecret) {
    issues.push('PETTER_API_SECRET not set in .env')
  }
  if (!petterOk) {
    issues.push('Petter API unreachable - is Aavegotchi-Petter running? Check PETTER_API_URL')
  }

  return {
    success: true,
    diagnostic: {
      petterUrl: petterUrl.slice(0, 50) + '...',
      hasSecret,
      petterOk,
      petterAddress: config.petterAddress || '0x9a3E95f448f3daB367dd9213D4554444faa272F1',
      baseRpcUrl: (config.baseRpcUrl || 'https://mainnet.base.org').slice(0, 50) + '...',
      readyToTrigger: hasSecret && petterOk,
      issues: issues.length > 0 ? issues : null,
    },
  }
})
