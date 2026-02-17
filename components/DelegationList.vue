<template>
  <div class="delegation-list">
    <div class="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">Delegating Owners</h2>
        <button
          @click="fetchOwners"
          :disabled="loading"
          class="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition disabled:opacity-50"
        >
          {{ loading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>

      <div v-if="loading && owners.length === 0" class="text-center py-8 text-slate-400">
        <p>Loading delegation list...</p>
      </div>

      <div v-else-if="owners.length === 0" class="text-center py-8 text-slate-400">
        <p>No users have delegated petting yet</p>
      </div>

      <div v-else class="space-y-4">
        <div class="flex justify-between text-sm text-slate-400 mb-2">
          <span>Total: {{ owners.length }} owner(s)</span>
          <span class="font-semibold text-white">{{ totalGotchis }} Aavegotchis to pet</span>
        </div>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="item in owners"
            :key="item.address"
            class="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition"
          >
            <a
              :href="`https://basescan.org/address/${item.address}`"
              target="_blank"
              rel="noopener noreferrer"
              class="font-mono text-sm text-blue-400 hover:text-blue-300 truncate flex-1 min-w-0"
            >
              {{ item.address.slice(0, 6) }}...{{ item.address.slice(-4) }}
            </a>
            <span class="text-emerald-400 font-medium ml-3 shrink-0">
              {{ item.gotchiCount }} gotchi{{ item.gotchiCount !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface DelegationOwner {
  address: string
  gotchiCount: number
}

const owners = ref<DelegationOwner[]>([])
const totalGotchis = ref(0)
const loading = ref(false)

const fetchOwners = async () => {
  loading.value = true
  try {
    const data = await $fetch<{ owners: DelegationOwner[]; totalGotchis: number }>(
      '/api/delegation/owners'
    )
    owners.value = data.owners || []
    totalGotchis.value = data.totalGotchis || 0
  } catch (err) {
    console.error('Failed to fetch delegation owners:', err)
    owners.value = []
    totalGotchis.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchOwners()
  setInterval(fetchOwners, 60000)
})
</script>
