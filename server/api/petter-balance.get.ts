import { createPublicClient, http, formatEther } from 'viem'
import { base } from 'viem/chains'

/** Returns the ETH balance of the petter address (or delegate if PETTER_BALANCE_ADDRESS is set). */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const balanceAddr = (config.petterBalanceAddress as string) || (config.public?.petterBalanceAddress as string) || ''
  const addr = balanceAddr.trim() || config.petterAddress
  if (!addr || typeof addr !== 'string' || !addr.startsWith('0x')) {
    return { balance: '0', address: config.petterAddress, balanceAddress: null }
  }

  try {
    const rpcUrl = config.baseRpcUrl || 'https://mainnet.base.org'
    const client = createPublicClient({
      chain: base,
      transport: http(rpcUrl),
    })
    const balance = await client.getBalance({ address: addr as `0x${string}` })
    const eth = parseFloat(formatEther(balance)).toFixed(4)
    const balAddr = (config.petterBalanceAddress as string) || (config.public?.petterBalanceAddress as string) || ''
    return {
      balance: eth,
      address: config.petterAddress,
      balanceAddress: balAddr.trim() || null,
    }
  } catch (err) {
    console.error('[petter-balance]', err)
    throw createError({ statusCode: 500, message: 'Failed to fetch balance' })
  }
})
