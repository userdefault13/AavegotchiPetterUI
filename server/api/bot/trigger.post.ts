import { checkAuth } from '~/lib/auth'

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
    const response = await fetch(`${baseUrl}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || 'Failed to trigger worker')
    }

    const result = await response.json()
    return { success: true, result }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to trigger bot',
    })
  }
})
