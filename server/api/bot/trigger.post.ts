import { checkAuth } from '~/lib/auth'
import { addManualTriggerLog } from '~/lib/kv'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const config = useRuntimeConfig()
  const workerUrl = config.workerUrl || process.env.WORKER_URL

  if (!workerUrl) {
    throw createError({
      statusCode: 500,
      message: 'Worker URL not configured. Set WORKER_URL to enable manual trigger.',
    })
  }

  try {
    const baseUrl = workerUrl.replace(/\/$/, '')
    let body: { force?: boolean } = {}
    try {
      body = (await readBody(event)) as { force?: boolean }
    } catch {
      /* empty body ok */
    }
    // Manual trigger always forces: batch pet all gotchis immediately, skip 12h cooldown
    const response = await fetch(`${baseUrl}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ force: body.force !== false }),
    })

    const text = await response.text()

    if (!response.ok) {
      let message = 'Failed to trigger worker'
      try {
        const json = JSON.parse(text)
        if (json?.error) message = json.error
      } catch {
        if (text?.trim().startsWith('<')) {
          message =
            'Cloudflare Worker error. Check Workers logs and ensure secrets (PRIVATE_KEY, WALLET_ADDRESS, BASE_RPC_URL, DASHBOARD_URL, REPORT_SECRET) are set via wrangler secret put.'
        } else if (text) {
          message = text.slice(0, 500)
        }
      }
      throw createError({
        statusCode: 500,
        message,
      })
    }

    const result = text ? JSON.parse(text) : {}
    await addManualTriggerLog({
      id: `manual-${Date.now()}`,
      timestamp: Date.now(),
      message: result.message || 'Manual trigger completed',
      petted: result.petted,
    })
    return { success: true, result }
  } catch (error: any) {
    const msg = error.message || 'Failed to trigger bot'
    // Surface connection/network errors more clearly
    if (msg.includes('fetch') || msg.includes('ECONNREFUSED') || msg.includes('ENOTFOUND')) {
      throw createError({
        statusCode: 500,
        message: `Cannot reach worker: ${msg}. Check WORKER_URL is set and the Cloudflare Worker is deployed.`,
      })
    }
    throw createError({
      statusCode: 500,
      message: msg,
    })
  }
})
