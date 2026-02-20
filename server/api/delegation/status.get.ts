import { createPublicClient, http, parseAbi } from 'viem'
import { base } from 'viem/chains'
import { getCookie } from 'h3'
import { isDelegatedOwner, checkAuth, ensureRawAddress } from '~/lib'

const AAVEGOTCHI_DIAMOND_ADDRESS = '0xA99c4B08201F2913Db8D28e71d020c4298F29dBF' as const

const AAVEGOTCHI_FACET_ABI = parseAbi([
  'function isPetOperatorForAll(address _owner, address _operator) external view returns (bool)',
  'function tokenIdsOfOwner(address _owner) external view returns (uint32[] memory)',
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

  let ownerAddress: `0x${string}`
  let rawPetterAddress: `0x${string}`
  try {
    ownerAddress = ensureRawAddress(session)
    rawPetterAddress = ensureRawAddress(petterAddress)
  } catch (addrErr: any) {
    throw createError({
      statusCode: 400,
      message: addrErr?.message || 'Invalid address format',
    })
  }

  try {
    const client = createPublicClient({
      chain: base,
      transport: http(config.baseRpcUrl),
    })

    const [approved, registered] = await Promise.all([
      client.readContract({
        address: AAVEGOTCHI_DIAMOND_ADDRESS,
        abi: AAVEGOTCHI_FACET_ABI,
        functionName: 'isPetOperatorForAll',
        args: [ownerAddress, rawPetterAddress],
      }),
      isDelegatedOwner(ownerAddress),
    ])

    let gotchiCount = 0
    if (approved) {
      const tokenIds = await client.readContract({
        address: AAVEGOTCHI_DIAMOND_ADDRESS,
        abi: AAVEGOTCHI_FACET_ABI,
        functionName: 'tokenIdsOfOwner',
        args: [ownerAddress],
      })
      gotchiCount = tokenIds.length
    }

    return {
      approved,
      registered,
      gotchiCount,
      petterAddress: rawPetterAddress,
      canRegister: approved && !registered,
    }
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      message: err.message || 'Failed to check status',
    })
  }
})
