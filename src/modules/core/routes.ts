import type { RouteRecordRaw } from 'vue-router'
import { resolveScreenRoutes } from '@/platform/screen-runtime/screen-route-resolver'
import { coreScreens } from './screens'

const routes: RouteRecordRaw[] = [...resolveScreenRoutes(coreScreens)]

export default routes
