import path from 'node:path'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  nitro: {
    preset: 'vercel',
  },
  modules: [
    '@nuxtjs/tailwindcss',
    (_options: unknown, nuxt: { hook: (name: string, fn: () => void) => void; options: Record<string, unknown> }) => {
      nuxt.hook('modules:done', () => {
        const root = (nuxt.options.rootDir as string) ?? process.cwd()
        const postcssOptions =
          (nuxt.options as Record<string, unknown>).postcss ??
          ((nuxt.options.build as Record<string, unknown>)?.postcss as Record<string, unknown>)?.postcssOptions ??
          ((nuxt.options.build as Record<string, unknown>)?.postcss as Record<string, unknown>)
        const plugins = postcssOptions?.plugins as Record<string, unknown> | undefined
        if (
          plugins?.tailwindcss &&
          typeof plugins.tailwindcss === 'string' &&
          (plugins.tailwindcss as string).includes('.nuxt/tailwind/postcss.mjs')
        ) {
          plugins.tailwindcss = path.join(root, 'tailwind.config.js')
        }
      })
    },
  ],
  runtimeConfig: {
    kvRestApiUrl: process.env.KV_REST_API_URL,
    kvRestApiToken: process.env.KV_REST_API_TOKEN,
    allowedAddress: process.env.ALLOWED_ADDRESS || '0x2127aa7265d573aa467f1d73554d17890b872e76',
    allowedAddresses: process.env.ALLOWED_ADDRESSES,
    reportSecret: process.env.REPORT_SECRET,
    petterAddress: (() => {
      const addr = process.env.PETTER_ADDRESS || process.env.WALLET_ADDRESS || '0x6c5FC27F465ac73466D3A10508d2ED8a68364bBF'
      const deprecated = ['0xb4c123857ea7d2f1343d749818c19af439c65e15']
      return deprecated.includes((addr || '').toLowerCase()) ? '0x6c5FC27F465ac73466D3A10508d2ED8a68364bBF' : addr
    })(),
    baseRpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    workerUrl: process.env.WORKER_URL,
    public: {
      allowedAddress: process.env.ALLOWED_ADDRESS || '0x2127aa7265d573aa467f1d73554d17890b872e76',
      allowedAddresses: process.env.ALLOWED_ADDRESSES,
      baseRpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
      petterAddress: (() => {
        const addr = process.env.PETTER_ADDRESS || process.env.WALLET_ADDRESS || '0x6c5FC27F465ac73466D3A10508d2ED8a68364bBF'
        const deprecated = ['0xb4c123857ea7d2f1343d749818c19af439c65e15']
        return deprecated.includes((addr || '').toLowerCase()) ? '0x6c5FC27F465ac73466D3A10508d2ED8a68364bBF' : addr
      })(),
    },
  },
})
