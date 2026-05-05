import type { RouteRecordRaw } from 'vue-router'
import { createScreenRoutes } from '@/platform/screen-runtime'
import { inventoryScreens } from './screens'

/**
 * Standard Acumatica-style screen routes
 * Discovers and mounts all ScreenDefinition objects registered in screens.ts
 */
export const inventoryRoutes: RouteRecordRaw[] = createScreenRoutes(inventoryScreens)
