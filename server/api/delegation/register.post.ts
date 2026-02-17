import { createPublicClient, http, parseAbi } from 'viem'
import { base } from 'viem/chains'
import { getCookie } from 'h3'
import { addDelegatedOwner, isDelegatedOwner, checkAuth } from '~/lib'

const AAVEGOTCHI_DIAMOND_ADDRESS = '0xA99c4B08201F2913Db8D28e71d020c4298F29dBF' as const

const AAVEGOTCHI_FACET_ABI = parseAbi([
  'function isPetOperatorForAll(address _owner, address _operator) external view returns (bool)',
  'function setPetOperatorForAll(address _operator, bool _approved) external',
])

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const config = useRuntimeConfig()
  const petterAddress = config.petterAddress || config.walletAddress

  if (!petterAddress || !config.baseRpcUrl) {
    throw createError({
      statusCode: 500,
      message: 'Petter not configured',
    })
  }

  const session = getCookie(event, 'auth_session') as string | undefined
  if (!session) {
    throw createError({
      statusCode: 401,
      message: 'Not authenticated',
    })
  }

  const ownerAddress = session as `0x${string}`

  try {
    const client = createPublicClient({
      chain: base,
      transport: http(config.baseRpcUrl),
    })

    const isApproved = await client.readContract({
      address: AAVEGOTCHI_DIAMOND_ADDRESS,
      abi: AAVEGOTCHI_FACET_ABI,
      functionName: 'isPetOperatorForAll',
      args: [ownerAddress, petterAddress as `0x${string}`],
    })

    if (!isApproved) {
      throw createError({
        statusCode: 400,
        message:
          'Please approve the petter first. Call setPetOperatorForAll on the Aavegotchi contract.',
      })
    }

    const alreadyRegistered = await isDelegatedOwner(ownerAddress)
    if (!alreadyRegistered) {
      await addDelegatedOwner(ownerAddress)
    }

    return {
      success: true,
      message:
        'Registered for auto-petting. Your Aavegotchis will be petted every 12 hours.',
    }
  } catch (err: any) {
    if (err.statusCode) throw err
    throw createError({
      statusCode: 500,
      message: err.message || 'Registration failed',
    })
  }
})
