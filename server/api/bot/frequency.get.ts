import { checkAuth } from '~/lib/auth'
import { getPettingIntervalHours } from '~/lib/kv'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const hours = await getPettingIntervalHours()
  return { pettingIntervalHours: hours }
})
