<template>
  <div class="delegation-card">
    <div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
      <h2 class="text-lg font-semibold mb-2">EIP PetOperator Delegation</h2>
      <p class="text-slate-400 text-sm mb-4">
        Keep your Aavegotchis in your wallet. Approve our petter to pet on your behalf—no transfer needed.
      </p>

      <div v-if="loading" class="text-center py-4">
        <p class="text-slate-400">Loading...</p>
      </div>

      <div v-else-if="!status" class="text-center py-4">
        <p class="text-slate-400">Connect your wallet to view delegation status. If already connected, refresh the page.</p>
      </div>

      <div v-else class="space-y-4">
        <div class="bg-white/5 rounded-lg p-4 font-mono text-sm break-all">
          <span class="text-slate-400">Petter address: </span>
          {{ petterAddress || '—' }}
        </div>

        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <span
              class="w-3 h-3 rounded-full"
              :class="status?.approved ? 'bg-emerald-500' : 'bg-amber-500'"
            />
            <span>{{ status?.approved ? 'Approved' : 'Not approved' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="w-3 h-3 rounded-full"
              :class="status?.registered ? 'bg-emerald-500' : 'bg-slate-500'"
            />
            <span>{{ status?.registered ? 'Registered' : 'Not registered' }}</span>
          </div>
          <div v-if="status?.gotchiCount !== undefined" class="text-sm text-slate-400">
            {{ status.gotchiCount }} Aavegotchi(es) in your wallet
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <button
            v-if="!status?.approved"
            @click="approveDelegation"
            :disabled="approving"
            class="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 font-medium"
          >
            {{ approving ? 'Confirm in wallet...' : '1. Approve Petter (sign tx)' }}
          </button>
          <template v-else-if="status?.canRegister">
            <button
              @click="register"
              :disabled="registering"
              class="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium"
            >
              {{ registering ? 'Registering...' : '2. Register for Auto-Petting' }}
            </button>
            <button
              @click="revokeDelegation"
              :disabled="revoking"
              class="px-4 py-2 text-slate-400 hover:text-white text-sm"
            >
              {{ revoking ? 'Revoking...' : 'Revoke approval' }}
            </button>
          </template>
          <template v-else-if="status?.registered">
            <div class="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm border border-emerald-500/50">
              ✓ You're all set! Your Aavegotchis will be petted every 12 hours.
            </div>
            <button
              @click="revokeDelegation"
              :disabled="revoking"
              class="px-4 py-2 bg-red-600/80 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 text-sm font-medium"
            >
              {{ revoking ? 'Revoking...' : 'Revoke & Change Petter' }}
            </button>
            <div class="mt-2 pt-2 border-t border-white/10">
              <p class="text-slate-400 text-xs mb-1">Revoke a different petter address:</p>
              <div class="flex flex-wrap gap-2 items-center">
                <button
                  v-if="petterAddress"
                  type="button"
                  @click="confirmRevoke(petterAddress)"
                  :disabled="revoking"
                  class="px-3 py-1.5 bg-red-600/60 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
                >
                  Revoke {{ shortenAddress(petterAddress) }}
                </button>
                <input
                  v-model="revokeAddress"
                  type="text"
                  placeholder="0x..."
                  class="flex-1 min-w-[140px] bg-white/10 border border-white/20 rounded px-3 py-1.5 text-sm font-mono placeholder-slate-500"
                />
                <button
                  type="button"
                  @click="revokeSpecificAddress"
                  :disabled="revoking || !revokeAddress"
                  class="px-3 py-1.5 bg-red-600/60 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
                >
                  Revoke
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getWalletClient, writeContract } from '@wagmi/core'
import { wagmiConfig, AAVEGOTCHI_DIAMOND_ADDRESS, AAVEGOTCHI_FACET_ABI, shortenAddress, ensureRawAddress } from '~/lib/wagmi'
import { useDelegationStatus } from '~/composables/useDelegationStatus'

const { status, loading, petterAddress, fetchStatus } = useDelegationStatus()
const revokeAddress = ref('')
const approving = ref(false)
const registering = ref(false)
const revoking = ref(false)

const approveDelegation = async () => {
  if (!petterAddress) {
    alert('Petter address not configured')
    return
  }
  approving.value = true
  try {
    const rawAddr = ensureRawAddress(petterAddress)
    const walletClient = await getWalletClient(wagmiConfig)
    if (!walletClient) {
      alert('Please connect your wallet first')
      return
    }
    await writeContract(wagmiConfig, {
      address: AAVEGOTCHI_DIAMOND_ADDRESS,
      abi: AAVEGOTCHI_FACET_ABI,
      functionName: 'setPetOperatorForAll',
      args: [rawAddr, true],
    })
    await fetchStatus()
  } catch (err: any) {
    console.error('Approve failed:', err)
    alert(err?.message || 'Approval failed')
  } finally {
    approving.value = false
  }
}

const register = async () => {
  registering.value = true
  try {
    await $fetch('/api/delegation/register', { method: 'POST' })
    await fetchStatus()
  } catch (err: any) {
    alert(err?.data?.message || err?.message || 'Registration failed')
  } finally {
    registering.value = false
  }
}

const revokeDelegation = async () => {
  if (!petterAddress) return
  if (!confirm('Revoke the current petter? You will need to approve again after updating the petter address.')) return
  await doRevoke(petterAddress.value)
}

const confirmRevoke = (addr: string) => {
  if (!confirm(`Revoke ${addr} as petter for your gotchis?`)) return
  doRevoke(addr)
}

const revokeSpecificAddress = async () => {
  const addr = revokeAddress.value?.trim()
  if (!addr || !addr.startsWith('0x')) {
    alert('Enter a valid address (0x...)')
    return
  }
  confirmRevoke(addr)
  revokeAddress.value = ''
}

const doRevoke = async (addr: string) => {
  revoking.value = true
  try {
    const rawAddr = ensureRawAddress(addr)
    const walletClient = await getWalletClient(wagmiConfig)
    if (!walletClient) {
      alert('Please connect your wallet first')
      return
    }
    await writeContract(wagmiConfig, {
      address: AAVEGOTCHI_DIAMOND_ADDRESS,
      abi: AAVEGOTCHI_FACET_ABI,
      functionName: 'setPetOperatorForAll',
      args: [rawAddr, false],
    })
    if (addr.toLowerCase() === petterAddress?.toLowerCase()) {
      await $fetch('/api/delegation/unregister', { method: 'POST' })
    }
    await fetchStatus()
    alert('Revoked successfully.')
  } catch (err: any) {
    console.error('Revoke failed:', err)
    alert(err?.message || 'Revoke failed')
  } finally {
    revoking.value = false
  }
}

onMounted(() => {
  fetchStatus()
})
</script>
