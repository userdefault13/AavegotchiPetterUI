import path from 'node:path'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
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
    petterApiUrl: process.env.PETTER_API_URL || 'http://localhost:3001',
    petterApiSecret: process.env.PETTER_API_SECRET || '',
    allowedAddress: process.env.ALLOWED_ADDRESS || '0x2127aa7265d573aa467f1d73554d17890b872e76',
    allowedAddresses: process.env.ALLOWED_ADDRESSES,
    petterAddress: (() => {
      const addr = process.env.PETTER_ADDRESS || process.env.WALLET_ADDRESS || '0x9a3E95f448f3daB367dd9213D4554444faa272F1'
      const deprecated = ['0xb4c123857ea7d2f1343d749818c19af439c65e15', '0x6c5fc27f465ac73466d3a10508d2ed8a68364bbf', '0xeFa494C63865e9Ab9DF001041558f26FaC897002']
      return deprecated.includes((addr || '').toLowerCase()) ? '0x9a3E95f448f3daB367dd9213D4554444faa272F1' : addr
    })(),
    baseRpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    petterBalanceAddress: process.env.PETTER_BALANCE_ADDRESS || '',
    /** Show Bot Control when Petter API is configured. */
    workerEnabled: !!(process.env.PETTER_API_SECRET && process.env.PETTER_API_SECRET.trim()),
    public: {
      allowedAddress: process.env.ALLOWED_ADDRESS || '0x2127aa7265d573aa467f1d73554d17890b872e76',
      allowedAddresses: process.env.ALLOWED_ADDRESSES,
      baseRpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
      petterAddress: (() => {
        const addr = process.env.PETTER_ADDRESS || process.env.WALLET_ADDRESS || '0x9a3E95f448f3daB367dd9213D4554444faa272F1'
        const deprecated = ['0xb4c123857ea7d2f1343d749818c19af439c65e15', '0x6c5fc27f465ac73466d3a10508d2ed8a68364bbf', '0xeFa494C63865e9Ab9DF001041558f26FaC897002']
        return deprecated.includes((addr || '').toLowerCase()) ? '0x9a3E95f448f3daB367dd9213D4554444faa272F1' : addr
      })(),
      petterBalanceAddress: process.env.PETTER_BALANCE_ADDRESS || '',
      /** Show Bot Control when PETTER_API_SECRET is set. */
      workerEnabled: !!(process.env.PETTER_API_SECRET && process.env.PETTER_API_SECRET.trim()),
    },
  },
})
