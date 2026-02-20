import { isAddress } from 'viem'

/**
 * Ensures the value is a raw 0x address. Rejects ENS names.
 * Base does not support ENS resolution - passing ENS causes "network does not support ENS" errors.
 */
export function ensureRawAddress(value: string | undefined | null): `0x${string}` {
  const trimmed = (value ?? '').trim()
  if (!trimmed) {
    throw new Error('Address is required')
  }
  if (trimmed.includes('.')) {
    throw new Error('Please use a raw wallet address (0x...). ENS names are not supported on Base.')
  }
  if (!isAddress(trimmed)) {
    throw new Error('Invalid address format. Use a raw wallet address (0x...).')
  }
  return trimmed as `0x${string}`
}

/** Returns true if the value is a valid raw address (not ENS). */
export function isRawAddress(value: string | undefined | null): boolean {
  if (!value?.trim()) return false
  if (value.includes('.')) return false
  return isAddress(value.trim())
}
