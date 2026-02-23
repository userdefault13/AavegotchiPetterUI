import { verifyMessage } from 'viem'
import { getCookie, setCookie, deleteCookie } from 'h3'
import { ensureRawAddress } from './address'

function getDefaultAllowed(): string {
  const fromEnv = process.env.ALLOWED_ADDRESS?.trim()
  return (fromEnv || '').toLowerCase()
}

function parseAllowedAddresses(allowedAddress?: string, allowedAddresses?: string): string[] {
  if (allowedAddresses) {
    return allowedAddresses
      .split(',')
      .map((a) => a.trim().toLowerCase())
      .filter(Boolean)
  }
  if (allowedAddress) {
    return [allowedAddress.toLowerCase()]
  }
  const def = getDefaultAllowed()
  return def ? [def] : []
}

export function isAddressAllowed(
  address: string,
  allowedAddress?: string,
  allowedAddresses?: string
): boolean {
  const list = parseAllowedAddresses(allowedAddress, allowedAddresses)
  return list.includes(address.toLowerCase())
}

export async function verifySignature(
  address: string,
  message: string,
  signature: string,
  allowedAddress?: string,
  allowedAddresses?: string
): Promise<boolean> {
  try {
    const rawAddr = ensureRawAddress(address)
    const isValid = await verifyMessage({
      address: rawAddr,
      message,
      signature: signature as `0x${string}`,
    })
    return isValid && isAddressAllowed(address, allowedAddress, allowedAddresses)
  } catch {
    return false
  }
}

export function createSession(event: any, address: string): void {
  const rawAddr = ensureRawAddress(address)
  setCookie(event, 'auth_session', rawAddr, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export function getSession(
  event: any,
  allowedAddress?: string,
  allowedAddresses?: string
): string | null {
  const session = getCookie(event, 'auth_session')
  if (!session || session.includes('.')) return null
  if (isAddressAllowed(session, allowedAddress, allowedAddresses)) {
    return session
  }
  return null
}

export function clearSession(event: any): void {
  deleteCookie(event, 'auth_session')
}

export function checkAuth(
  event: any,
  allowedAddress?: string,
  allowedAddresses?: string
): boolean {
  let allowed = allowedAddress
  let allowedList = allowedAddresses
  if (!allowed && !allowedList) {
    try {
      const config = useRuntimeConfig()
      allowed = (config.allowedAddress || process.env.ALLOWED_ADDRESS || '').toString().trim()
      allowedList = (config.allowedAddresses || process.env.ALLOWED_ADDRESSES || '').toString().trim()
    } catch {
      allowed = (process.env.ALLOWED_ADDRESS || '').toString().trim()
      allowedList = (process.env.ALLOWED_ADDRESSES || '').toString().trim()
    }
  }
  const session = getCookie(event, 'auth_session')
  if (!session || session.includes('.')) return false
  return isAddressAllowed(session, allowed, allowedList)
}
