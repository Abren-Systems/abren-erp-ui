import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type UserConfig } from 'vite-plus'
import type { PluginOption } from 'vite-plus'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

import { lintConfig } from './build/vite/lint.ts'
import { serverConfig } from './build/vite/server.ts'
import { buildConfig } from './build/vite/build.ts'

const plugins: PluginOption[] = [vue(), tailwindcss() as unknown as PluginOption]

export default defineConfig({
  lint: lintConfig as UserConfig['lint'],
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
  plugins,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: serverConfig,
  build: buildConfig,
})
