import { createPublicClient, http, parseAbi } from 'viem'
import { base } from 'viem/chains'
import { getDelegatedOwners, checkAuth, isRawAddress } from '~/lib'

const AAVEGOTCHI_DIAMOND_ADDRESS = '0xA99c4B08201F2913Db8D28e71d020c4298F29dBF' as const

const AAVEGOTCHI_FACET_ABI = parseAbi([
  'function tokenIdsOfOwner(address _owner) external view returns (uint32[] memory)',
  'function isPetOperatorForAll(address _owner, address _operator) external view returns (bool)',
])

export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const config = useRuntimeConfig()
  if (!config.baseRpcUrl) {
    throw createError({
      statusCode: 500,
      message: 'Base RPC not configured',
    })
  }

  try {
    const owners = await getDelegatedOwners()
    const rawOwners = owners.filter((a) => isRawAddress(a))
    if (rawOwners.length === 0) {
      return { owners: [], totalGotchis: 0 }
    }

    const client = createPublicClient({
      chain: base,
      transport: http(config.baseRpcUrl),
    })

    const petterAddress = (config.petterAddress as string) || ''
    if (!petterAddress || !petterAddress.startsWith('0x')) {
      return { owners: [], totalGotchis: 0 }
    }

    const results = await Promise.all(
      rawOwners.map(async (address) => {
        try {
          const [tokenIds, approved] = await Promise.all([
            client.readContract({
              address: AAVEGOTCHI_DIAMOND_ADDRESS,
              abi: AAVEGOTCHI_FACET_ABI,
              functionName: 'tokenIdsOfOwner',
              args: [address as `0x${string}`],
            }),
            client.readContract({
              address: AAVEGOTCHI_DIAMOND_ADDRESS,
              abi: AAVEGOTCHI_FACET_ABI,
              functionName: 'isPetOperatorForAll',
              args: [address as `0x${string}`, petterAddress as `0x${string}`],
            }),
          ])
          // Only count gotchis from owners who have approved THIS petter on-chain
          const gotchiCount = approved ? tokenIds.length : 0
          return { address, gotchiCount, approved }
        } catch (err) {
          return { address, gotchiCount: 0, approved: false }
        }
      })
    )

    // Only include owners who have approved THIS petter on-chain (KV alone is stale)
    const approvedOwners = results.filter((r) => r.approved)
    const totalGotchis = approvedOwners.reduce((sum, r) => sum + r.gotchiCount, 0)

    return {
      owners: approvedOwners.map(({ address, gotchiCount }) => ({ address, gotchiCount })),
      totalGotchis,
    }
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      message: err.message || 'Failed to fetch delegation owners',
    })
  }
})
