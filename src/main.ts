import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'

import App from './App.vue'
import { router } from './app/router'

import './assets/main.css'

import { renderingRuntime } from './platform/chrome/renderers/RenderingRuntime'

renderingRuntime.configure({
  rendererMappings: {
    AppInput: () => import('@/shared/components/primitives/input/AppInput.vue'),
    AppBadge: () => import('@/shared/components/primitives/badge/AppBadge.vue'),
  },
})

const app = createApp(App)

// ── State Management ──────────────────────────────────
app.use(createPinia())

// ── Server State (TanStack Query) ─────────────────────
app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
        refetchOnWindowFocus: false, // ERP: don't surprise users with refetches
      },
    },
  },
})

// ── Router ────────────────────────────────────────────
app.use(router)

app.mount('#app')
