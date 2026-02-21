/**
 * POST /api/bot/trigger
 * Manual trigger - calls runPetting directly (Option B: Vercel serverless).
 * Requires auth (dashboard session). Force=true skips 12h cooldown.
 */
import { checkAuth } from '~/lib/auth'
import { addManualTriggerLog } from '~/lib/kv'
import { runPetting } from '~/lib/pet'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const config = useRuntimeConfig()
  const privateKey = config.petterPrivateKey || process.env.PETTER_PRIVATE_KEY
  const petterAddress = config.petterAddress || process.env.PETTER_ADDRESS || '0x9a3E95f448f3daB367dd9213D4554444faa272F1'
  const baseRpcUrl = config.baseRpcUrl || process.env.BASE_RPC_URL || 'https://mainnet.base.org'

  if (!privateKey || !privateKey.startsWith('0x')) {
    setResponseStatus(event, 500)
    return {
      success: false,
      error: 'PETTER_PRIVATE_KEY not configured. Set in Vercel env vars to enable manual trigger.',
    }
  }

  try {
    let body: { force?: boolean } = {}
    try {
      body = (await readBody(event)) as { force?: boolean }
    } catch {
      /* empty body ok */
    }

    const result = await runPetting({
      force: body?.force !== false,
      privateKey,
      petterAddress,
      baseRpcUrl,
    })

    await addManualTriggerLog({
      id: `manual-${Date.now()}`,
      timestamp: Date.now(),
      message: result.message || 'Manual trigger completed',
      petted: result.petted,
    })

    return { success: true, result }
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : typeof error === 'string' ? error : 'Failed to trigger bot'
    console.error('[bot/trigger]', msg, error)
    setResponseStatus(event, 500)
    return { success: false, error: msg }
  }
})
