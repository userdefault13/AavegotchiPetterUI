import { createConfig, http, injected } from '@wagmi/core'
import { base } from '@wagmi/core/chains'

export const metaMaskConnector = injected({ target: 'metaMask' })
export const coinbaseConnector = injected({ target: 'coinbaseWallet' })

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [metaMaskConnector, coinbaseConnector],
  transports: {
    [base.id]: http(),
  },
  ssr: true,
})

export const AAVEGOTCHI_DIAMOND_ADDRESS = '0xA99c4B08201F2913Db8D28e71d020c4298F29dBF' as const

export const AAVEGOTCHI_FACET_ABI = [
  {
    type: 'function',
    name: 'isPetOperatorForAll',
    stateMutability: 'view',
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_operator', type: 'address' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function',
    name: 'setPetOperatorForAll',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_operator', type: 'address' },
      { name: '_approved', type: 'bool' },
    ],
    outputs: [],
  },
] as const

export const AAVEGOTCHI_GAME_FACET_ABI = [
  {
    inputs: [{ internalType: 'uint256[]', name: '_tokenIds', type: 'uint256[]' }],
    name: 'interact',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_tokenId', type: 'uint256' }],
    name: 'kinship',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_owner', type: 'address' }],
    name: 'tokenIdsOfOwner',
    outputs: [{ internalType: 'uint32[]', name: '', type: 'uint32[]' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
