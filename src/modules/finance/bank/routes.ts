import type { RouteRecordRaw } from 'vue-router'
import { createScreenRoutes } from '@/platform/screen-runtime'
import { bankScreens } from './screens'

/**
 * Standard Acumatica-style screen routes
 * Discovers and mounts all ScreenDefinition objects registered in screens.ts
 */
export const bankRoutes: RouteRecordRaw[] = createScreenRoutes(bankScreens)
