import { checkAuth } from '~/lib/auth'
import { setPettingIntervalHours } from '~/lib/kv'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const body = await readBody(event).catch(() => ({})) as { pettingIntervalHours?: number }
  const hours = body?.pettingIntervalHours

  // Allow 30 sec (30/3600) to 24 hours for test mode support
  if (typeof hours !== 'number' || hours < 30 / 3600 || hours > 24) {
    throw createError({
      statusCode: 400,
      message: 'pettingIntervalHours must be between 30 seconds and 24 hours',
    })
  }

  await setPettingIntervalHours(hours)
  return { pettingIntervalHours: hours, ok: true }
})
