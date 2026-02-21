import { proxyToPetter } from '~/server/utils/petterProxy'
import { checkAuth } from '~/lib/auth'
import { setResponseStatus } from 'h3'

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
      setResponseStatus(event, 200)
      return { success: false, error: 'Unauthorized' }
    }
    const result = await proxyToPetter(event, '/api/bot/trigger', { method: 'POST' })
    setResponseStatus(event, 200)
    return { success: true, result }
  } catch (error: unknown) {
    const msg = toErrorMsg(error)
    setResponseStatus(event, 200)
    return { success: false, error: msg }
  }
})
