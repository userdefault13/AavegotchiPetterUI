import { getWorkerLogs, checkAuth } from '~/lib'

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const query = getQuery(event)
  const limit = query.limit ? parseInt(query.limit as string) : 100

  const logs = await getWorkerLogs(Math.min(limit, 200))
  return logs
})
