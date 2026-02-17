import { createPublicClient, http, parseAbi } from 'viem'
import { base } from 'viem/chains'
import { getDelegatedOwners, checkAuth } from '~/lib'

const AAVEGOTCHI_DIAMOND_ADDRESS = '0xA99c4B08201F2913Db8D28e71d020c4298F29dBF' as const

const AAVEGOTCHI_FACET_ABI = parseAbi([
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
  if (!config.baseRpcUrl) {
    throw createError({
      statusCode: 500,
      message: 'Base RPC not configured',
    })
  }

  try {
    const owners = await getDelegatedOwners()
    if (owners.length === 0) {
      return { owners: [], totalGotchis: 0 }
    }

    const client = createPublicClient({
      chain: base,
      transport: http(config.baseRpcUrl),
    })

    const results = await Promise.all(
      owners.map(async (address) => {
        try {
          const tokenIds = await client.readContract({
            address: AAVEGOTCHI_DIAMOND_ADDRESS,
            abi: AAVEGOTCHI_FACET_ABI,
            functionName: 'tokenIdsOfOwner',
            args: [address as `0x${string}`],
          })
          return { address, gotchiCount: tokenIds.length }
        } catch (err) {
          return { address, gotchiCount: 0 }
        }
      })
    )

    const totalGotchis = results.reduce((sum, r) => sum + r.gotchiCount, 0)

    return {
      owners: results,
      totalGotchis,
    }
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      message: err.message || 'Failed to fetch delegation owners',
    })
  }
})
