import { getCookie } from 'h3'
import { createPublicClient, http, parseAbi } from 'viem'
import { base } from 'viem/chains'
import { isDelegatedOwner, checkAuth } from '~/lib'
import { ensureRawAddress } from '~/lib/address'

const AAVEGOTCHI_DIAMOND_ADDRESS = '0xA99c4B08201F2913Db8D28e71d020c4298F29dBF' as const

const AAVEGOTCHI_FACET_ABI = parseAbi([
  'function isPetOperatorForAll(address _owner, address _operator) external view returns (bool)',
])

/** Returns whether the authenticated user is registered for auto-petting with the CURRENT petter. */
export default defineEventHandler(async (event) => {
  if (!checkAuth(event)) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const session = getCookie(event, 'auth_session') as string | undefined
  if (!session) {
    throw createError({
      statusCode: 401,
      message: 'Not authenticated',
    })
  }

  try {
    const ownerAddress = ensureRawAddress(session)
    const inKv = await isDelegatedOwner(ownerAddress)
    if (!inKv) {
      return { registered: false }
    }

    const config = useRuntimeConfig()
    const petterAddress = (config.petterAddress as string) || ''
    if (!petterAddress || !petterAddress.startsWith('0x')) {
      return { registered: false }
    }

    // Must have approved THIS petter on-chain; KV alone (from old petter) is not enough
    const client = createPublicClient({
      chain: base,
      transport: http(config.baseRpcUrl || 'https://mainnet.base.org'),
    })
    const approved = await client.readContract({
      address: AAVEGOTCHI_DIAMOND_ADDRESS,
      abi: AAVEGOTCHI_FACET_ABI,
      functionName: 'isPetOperatorForAll',
      args: [ownerAddress as `0x${string}`, petterAddress as `0x${string}`],
    })

    // Must be in KV and have approved THIS petter on-chain
    return { registered: inKv && approved }
  } catch (addrErr: any) {
    throw createError({
      statusCode: 400,
      message: addrErr?.message || 'Invalid address format',
    })
  }
})
