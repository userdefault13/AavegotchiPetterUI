/**
 * POST /api/bot/trigger
 * Manual trigger - calls runPetting directly (Option B: Vercel serverless).
 * Requires auth (dashboard session). Force=true skips 12h cooldown.
 * Always returns 200 with JSON so client gets real error messages (Vercel replaces 500 body).
 */
import { checkAuth } from '~/lib/auth'
import { addManualTriggerLog } from '~/lib/kv'
import { runPetting } from '~/lib/pet'

function toErrorMsg(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  try {
    return String(err)
  } catch {
    return 'Unknown error'
  }
}

export default defineEventHandler(async (event) => {
  try {
    if (!checkAuth(event)) {
      return { success: false, error: 'Unauthorized' }
    }

    const config = useRuntimeConfig()
    // Prefer process.env at runtime (Vercel injects at runtime; Nuxt config may be baked empty at build)
    const privateKey =
      process.env.PETTER_PRIVATE_KEY || config.petterPrivateKey
    const petterAddress = config.petterAddress || process.env.PETTER_ADDRESS || '0x9a3E95f448f3daB367dd9213D4554444faa272F1'
    const baseRpcUrl = config.baseRpcUrl || process.env.BASE_RPC_URL || 'https://mainnet.base.org'

    if (!privateKey || !privateKey.startsWith('0x')) {
      return {
        success: false,
        error: 'PETTER_PRIVATE_KEY not configured. Set in Vercel env vars to enable manual trigger.',
      }
    }

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

    try {
      await addManualTriggerLog({
        id: `manual-${Date.now()}`,
        timestamp: Date.now(),
        message: result.message || 'Manual trigger completed',
        petted: result.petted,
      })
    } catch (kvErr) {
      console.error('[bot/trigger] addManualTriggerLog failed:', kvErr)
      /* continue - petting succeeded */
    }

    return { success: true, result }
  } catch (error: unknown) {
    const msg = toErrorMsg(error)
    console.error('[bot/trigger]', msg, error)
    return { success: false, error: msg }
  }
})
