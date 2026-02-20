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

export function useDelegationStatus() {
  const config = useRuntimeConfig()
  const petterAddress = (config.public?.petterAddress as string) || '0x6cSFC27F465ac73466D3A10508d2ED8a68364bBF'

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
