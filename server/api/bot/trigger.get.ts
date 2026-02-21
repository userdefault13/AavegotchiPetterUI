/**
 * GET /api/bot/trigger - Diagnostic endpoint.
 * Returns config status (no secrets) to debug trigger failures.
 * Requires auth.
 */
import { checkAuth } from '~/lib/auth'

export default defineEventHandler(async (event) => {
  const authenticated = checkAuth(event)
  if (!authenticated) {
    return { success: false, error: 'Unauthorized', hint: 'Connect wallet and sign in first' }
  }

  const config = useRuntimeConfig()
  const hasPetterKey =
    !!(config.petterPrivateKey && config.petterPrivateKey.startsWith('0x')) ||
    !!(process.env.PETTER_PRIVATE_KEY && process.env.PETTER_PRIVATE_KEY.startsWith('0x'))
  const hasKv = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)

  let kvOk = false
  if (hasKv) {
    try {
      const { getBotState } = await import('~/lib/kv')
      await getBotState()
      kvOk = true
    } catch {
      kvOk = false
    }
  }

  const issues: string[] = []
  if (!hasPetterKey) {
    issues.push('PETTER_PRIVATE_KEY not set in Vercel → Project Settings → Environment Variables')
  }
  if (!hasKv) {
    issues.push('KV_REST_API_URL or KV_REST_API_TOKEN not set (need Upstash KV)')
  } else if (!kvOk) {
    issues.push('KV connection failed - check KV_REST_API_URL and KV_REST_API_TOKEN')
  }

  return {
    success: true,
    diagnostic: {
      hasPetterKey,
      hasKv,
      kvOk,
      petterAddress: config.petterAddress || process.env.PETTER_ADDRESS || '0x9a3E95f448f3daB367dd9213D4554444faa272F1',
      baseRpcUrl: (config.baseRpcUrl || process.env.BASE_RPC_URL || 'https://mainnet.base.org').slice(0, 50) + '...',
      readyToTrigger: hasPetterKey && kvOk,
      issues: issues.length > 0 ? issues : null,
    },
  }
})
