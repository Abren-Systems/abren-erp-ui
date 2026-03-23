import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('./pages/LoginPage.vue'),
    meta: { layout: 'public' },
  },
]

export default routes
