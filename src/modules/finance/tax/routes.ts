import type { RouteRecordRaw } from 'vue-router'
import { resolveScreenRoutes } from '@/platform/screen-runtime'
import { taxScreens } from './screens'

export const taxRoutes: RouteRecordRaw[] = [...resolveScreenRoutes(taxScreens)]
