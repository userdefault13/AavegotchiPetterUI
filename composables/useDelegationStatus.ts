import { ref, type Ref } from 'vue'
import { getAccount, readContract } from '@wagmi/core'
import {
  wagmiConfig,
  AAVEGOTCHI_DIAMOND_ADDRESS,
  AAVEGOTCHI_FACET_ABI,
  ensureRawAddress,
} from '~/lib/wagmi'

export interface DelegationStatus {
  approved: boolean
  registered: boolean
  gotchiCount: number
  petterAddress: string
  canRegister: boolean
}

const CORRECT_PETTER_ADDRESS = '0x9a3E95f448f3daB367dd9213D4554444faa272F1' as const
const DEPRECATED_PETTER_ADDRESSES = ['0xb4c123857ea7d2f1343d749818c19af439c65e15', '0x6c5fc27f465ac73466d3a10508d2ed8a68364bbf', '0xb5E8181aE736E022E806e3aAE40F4E34dC49455D']

export function useDelegationStatus() {
  const config = useRuntimeConfig()
  let petterAddress = (config.public?.petterAddress as string) || CORRECT_PETTER_ADDRESS
  if (DEPRECATED_PETTER_ADDRESSES.includes(petterAddress.toLowerCase())) {
    petterAddress = CORRECT_PETTER_ADDRESS
  }

  const status: Ref<DelegationStatus | null> = ref(null)
  const loading = ref(true)

  const fetchStatus = async () => {
    if (typeof window === 'undefined') return
    const ownerAddress = getAccount(wagmiConfig).address
    if (!ownerAddress || !petterAddress) {
      status.value = null
      loading.value = false
      return
    }
    try {
      const rawPetter = ensureRawAddress(petterAddress)
      const [approved, registeredRes] = await Promise.all([
        readContract(wagmiConfig, {
          address: AAVEGOTCHI_DIAMOND_ADDRESS,
          abi: AAVEGOTCHI_FACET_ABI,
          functionName: 'isPetOperatorForAll',
          args: [ownerAddress, rawPetter],
        }),
        $fetch<{ registered: boolean }>('/api/delegation/registered').catch(() => ({ registered: false })),
      ])
      let gotchiCount = 0
      if (approved) {
        const tokenIds = await readContract(wagmiConfig, {
          address: AAVEGOTCHI_DIAMOND_ADDRESS,
          abi: AAVEGOTCHI_FACET_ABI,
          functionName: 'tokenIdsOfOwner',
          args: [ownerAddress],
        })
        gotchiCount = Array.isArray(tokenIds) ? tokenIds.length : 0
      }
      status.value = {
        approved,
        registered: registeredRes.registered,
        gotchiCount,
        petterAddress,
        canRegister: approved && !registeredRes.registered,
      }
    } catch (err) {
      console.error('Failed to fetch delegation status:', err)
      status.value = null
    } finally {
      loading.value = false
    }
  }

  return { status, loading, petterAddress, fetchStatus }
}
