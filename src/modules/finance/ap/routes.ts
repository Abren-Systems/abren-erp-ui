import type { RouteRecordRaw } from 'vue-router'
import { resolveScreenRoutes } from '@/platform/screen-runtime'
import { apScreens } from './screens'

export default [
  // --- Payment Requests (Screen Runtime) ---
  ...resolveScreenRoutes(apScreens),
] satisfies RouteRecordRaw[]
