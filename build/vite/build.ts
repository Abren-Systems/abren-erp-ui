export const buildConfig = {
  rollupOptions: {
    output: {
      manualChunks(id: string) {
        if (id.includes('node_modules')) {
          if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
            return 'vendor-vue'
          }
          if (id.includes('@tanstack')) {
            return 'vendor-tanstack'
          }
        }
      },
    },
  },
}
