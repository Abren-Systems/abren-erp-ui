import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type UserConfig, type PluginOption } from 'vite-plus'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

import { lintConfig } from './build/vite/lint.ts'
import { serverConfig } from './build/vite/server.ts'
import { buildConfig } from './build/vite/build.ts'

/**
 * Vite Configuration for Abren ERP
 * Optimized for vite-plus toolchain with oxlint and vitest.
 */
export default defineConfig({
  lint: lintConfig as unknown as UserConfig['lint'],
  test: {
    environment: 'jsdom',
    root: fileURLToPath(new URL('./', import.meta.url)),
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/**/*.d.ts', 'src/**/index.ts', 'src/main.ts'],
    },
  },
  fmt: {
    semi: false,
    singleQuote: true,
    trailingComma: 'all',
    printWidth: 100,
    tabWidth: 2,
    arrowParens: 'always',
    endOfLine: 'lf',
    sortPackageJson: false,
    ignorePatterns: [],
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('fluent-'),
        },
      },
    }),
    tailwindcss() as unknown as PluginOption,
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: serverConfig as unknown as UserConfig['server'],
  build: buildConfig as unknown as UserConfig['build'],
})
