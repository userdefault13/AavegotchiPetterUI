<template>
  <div class="wallet-connect">
    <div v-if="!isConnected" class="space-y-4">
      <p class="text-slate-400">Connect with MetaMask or Coinbase Wallet only</p>
      <div class="flex flex-col sm:flex-row gap-3">
        <button
          @click="connectWallet('metaMask')"
          :disabled="connecting"
          class="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {{ connecting ? 'Connecting...' : 'MetaMask' }}
        </button>
        <button
          @click="connectWallet('coinbaseWallet')"
          :disabled="connecting"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {{ connecting ? 'Connecting...' : 'Coinbase Wallet' }}
        </button>
      </div>
      <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>
      <p v-if="error" class="text-slate-400 text-xs mt-1">
        Have Uniswap or other wallets? Disable them or use a private window with only MetaMask or Coinbase Wallet.
      </p>
    </div>
    <div v-else class="space-y-4">
      <div class="bg-emerald-500/20 border border-emerald-500/50 rounded-lg p-4">
        <p class="text-emerald-400 font-medium">Connected</p>
        <p class="text-slate-300 text-sm mt-1 break-all">{{ address }}</p>
      </div>
      <p v-if="!isAuthenticated" class="text-amber-400/90 text-sm">
        Sign in below to access Bot Control, Delegation List, and full dashboard.
      </p>
      <button
        v-if="!isAuthenticated"
        @click="signMessage"
        :disabled="signing"
        class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ signing ? 'Signing...' : 'Sign Message to Login' }}
      </button>
      <button
        v-else
        @click="disconnectWallet"
        class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Disconnect
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAccount, connect, disconnect, signMessage as wagmiSignMessage } from '@wagmi/core'
import { wagmiConfig, metaMaskConnector, coinbaseConnector } from '~/lib/wagmi'

const config = useRuntimeConfig()
const allowedAddress = (config.public?.allowedAddress || '0x2127aa7265d573aa467f1d73554d17890b872e76').toLowerCase()

const address = ref<string>('')
const isConnected = ref(false)
const isAuthenticated = ref(false)
const connecting = ref(false)
const signing = ref(false)
const error = ref<string>('')

const checkAuth = async () => {
  try {
    const response = await $fetch<{ authenticated: boolean }>('/api/auth/check')
    isAuthenticated.value = response.authenticated
  } catch (err) {
    isAuthenticated.value = false
  }
}

const connectWallet = async (target: 'metaMask' | 'coinbaseWallet') => {
  connecting.value = true
  error.value = ''

  try {
    const connector = target === 'metaMask' ? metaMaskConnector : coinbaseConnector
    const result = await connect(wagmiConfig, { connector })

    if (result?.accounts?.[0]) {
      address.value = result.accounts[0]
      isConnected.value = true

      if (result.accounts[0].toLowerCase() !== allowedAddress) {
        error.value = `Your address is not whitelisted. Only ${allowedAddress} is allowed.`
        isConnected.value = false
      } else {
        await checkAuth()
      }
    }
  } catch (err: any) {
    const msg = err?.message || 'Failed to connect wallet'
    if (msg.includes('Provider not found')) {
      error.value =
        'MetaMask/Coinbase not found. Disable Uniswap Wallet and other extensions, or use a private window with only MetaMask or Coinbase.'
    } else if (msg.includes('ethereum') && msg.includes('getter')) {
      error.value =
        'Wallet conflict detected. Try disabling other wallet extensions or use a private window with only MetaMask or Coinbase Wallet.'
    } else {
      error.value = msg
    }
    isConnected.value = false
  } finally {
    connecting.value = false
  }
}

const signMessage = async () => {
  signing.value = true
  error.value = ''

  try {
    const message = `Sign in to Aavegotchi Petter Bot\n\nAddress: ${address.value}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`

    const signature = await wagmiSignMessage(wagmiConfig, {
      message,
      account: address.value as `0x${string}`,
    })

    const response = await $fetch<{ success: boolean }>('/api/auth/verify', {
      method: 'POST',
      body: {
        address: address.value,
        message,
        signature,
      },
    })

    if (response.success) {
      isAuthenticated.value = true
      // Full reload so parent HomeDashboard re-checks auth and shows all sections
      window.location.href = '/'
    }
  } catch (err: any) {
    error.value = err?.message || err?.data?.message || 'Failed to sign message'
  } finally {
    signing.value = false
  }
}

const disconnectWallet = async () => {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    await disconnect(wagmiConfig)
    isConnected.value = false
    isAuthenticated.value = false
    address.value = ''
    await navigateTo('/')
  } catch (err) {
    console.error('Failed to disconnect:', err)
  }
}

onMounted(async () => {
  if (typeof window === 'undefined') return
  const account = getAccount(wagmiConfig)
  if (account.isConnected && account.address) {
    address.value = account.address
    isConnected.value = true
    await checkAuth()
  }
})
</script>
