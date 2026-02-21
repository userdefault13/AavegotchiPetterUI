/**
 * Proxy requests to Aavegotchi-Petter API.
 * Dashboard checks auth (session) first, then forwards to Petter with secret.
 */
import { getHeader, getMethod, getQuery, readBody } from 'h3'
import type { H3Event } from 'h3'

export function getPetterBaseUrl(): string {
  const config = useRuntimeConfig()
  const url = (config.petterApiUrl as string) || 'http://localhost:3001'
  return String(url).replace(/\/$/, '')
}

export function getPetterSecret(): string {
  const config = useRuntimeConfig()
  return String((config.petterApiSecret as string) || '')
}

export async function proxyToPetter(event: H3Event, path: string, options?: { body?: unknown; method?: string }): Promise<unknown> {
  const baseUrl = getPetterBaseUrl()
  const secret = getPetterSecret()
  if (!secret) {
    throw createError({ statusCode: 500, message: 'PETTER_API_SECRET not configured' })
  }

  const method = options?.method || getMethod(event)
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
  const query = getQuery(event)
  const queryStr = Object.keys(query).length ? `?${new URLSearchParams(query as Record<string, string>).toString()}` : ''

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Report-Secret': secret,
  }

  let body: string | undefined
  if (options?.body !== undefined) {
    body = JSON.stringify(options.body)
  } else if (['POST', 'PUT', 'PATCH'].includes(method)) {
    try {
      const raw = await readBody(event)
      body = raw ? JSON.stringify(raw) : undefined
    } catch {
      /* empty body ok */
    }
  }

  const res = await fetch(`${url}${queryStr}`, {
    method,
    headers,
    body,
  })

  const text = await res.text()
  let data: unknown
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = { error: text || 'Invalid response' }
  }

  if (!res.ok) {
    const err = data as { error?: string }
    throw createError({
      statusCode: res.status,
      message: err?.error || res.statusText || 'Petter API error',
    })
  }

  return data
}
