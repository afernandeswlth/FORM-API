export default defineNuxtConfig({
  devtools: { enabled: false },
  nitro: { preset: 'vercel' },
  app: {
    head: {
      title: 'WLTH Forms Portal',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    },
  },
})
