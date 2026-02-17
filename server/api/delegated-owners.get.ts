import { getDelegatedOwners } from '~/lib/kv'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const reportSecret = config.reportSecret || process.env.REPORT_SECRET

  if (!reportSecret) {
    throw createError({
      statusCode: 500,
      message: 'Report secret not configured',
    })
  }

  const authHeader = getHeader(event, 'x-report-secret')
  if (authHeader !== reportSecret) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const owners = await getDelegatedOwners()
  return { owners }
})
