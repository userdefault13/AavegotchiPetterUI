import { verifySignature, createSession, isAddressAllowed } from '~/lib/auth'
import { ensureRawAddress } from '~/lib/address'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const { address, message, signature } = body

  if (!address || !message || !signature) {
    throw createError({
      statusCode: 400,
      message: 'Missing required fields',
    })
  }

  try {
    ensureRawAddress(address)
  } catch (addrErr: any) {
    throw createError({
      statusCode: 400,
      message: addrErr?.message || 'Invalid address. Use a raw wallet address (0x...). ENS is not supported on Base.',
    })
  }

  const allowedAddress = config.allowedAddress
  const allowedAddresses = config.allowedAddresses
  if (!isAddressAllowed(address, allowedAddress, allowedAddresses)) {
    throw createError({
      statusCode: 403,
      message: 'Address not whitelisted',
    })
  }

  const isValid = await verifySignature(address, message, signature, allowedAddress, allowedAddresses)

  if (!isValid) {
    throw createError({
      statusCode: 401,
      message: 'Invalid signature',
    })
  }

  createSession(event, address)

  return { success: true, address }
})
