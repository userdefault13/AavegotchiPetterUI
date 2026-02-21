/**
 * POST /api/bot/run
 * Executes petting logic (Option B: Vercel serverless).
 * Auth: X-Report-Secret header (for cron/scheduler).
 * ONLY calls interact() on Aavegotchi diamond - no ETH transfers.
 */
import { getHeader } from 'h3'
import { runPetting } from '~/lib/pet'

function checkRunAuth(event: { node?: { req?: { headers?: unknown } } }) {
  const config = useRuntimeConfig()
  const secret = config.reportSecret || process.env.REPORT_SECRET
  if (!secret) return false
  const header = getHeader(event, 'x-report-secret')
  return header === secret
}

export default defineEventHandler(async (event) => {
  if (!checkRunAuth(event)) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const config = useRuntimeConfig()
  const privateKey = config.petterPrivateKey || process.env.PETTER_PRIVATE_KEY
  const petterAddress = config.petterAddress || process.env.PETTER_ADDRESS || '0x9a3E95f448f3daB367dd9213D4554444faa272F1'
  const baseRpcUrl = config.baseRpcUrl || process.env.BASE_RPC_URL || 'https://mainnet.base.org'

  if (!privateKey || !privateKey.startsWith('0x')) {
    throw createError({
      statusCode: 500,
      message: 'PETTER_PRIVATE_KEY not configured. Set in Vercel env vars.',
    })
  }

  let body: { force?: boolean } = {}
  try {
    body = (await readBody(event)) as { force?: boolean }
  } catch {
    /* empty body ok */
  }

  try {
    return await runPetting({
      force: body?.force === true,
      privateKey,
      petterAddress,
      baseRpcUrl,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw createError({ statusCode: 500, message: msg })
  }
})
