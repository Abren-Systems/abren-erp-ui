import type { RouteRecordRaw } from 'vue-router'
import { resolveScreenRoutes } from '@/platform/screen-runtime/screen-route-resolver'
import { coreScreens } from './screens'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('./ui/pages/LoginPage.vue'),
    meta: { layout: 'public' },
  },
  ...resolveScreenRoutes(coreScreens),
]

export default routes
