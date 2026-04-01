import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('./ui/pages/LoginPage.vue'),
    meta: { layout: 'public' },
  },
  {
    path: '/users',
    name: 'CoreUsers',
    component: () => import('./ui/pages/UsersPage.vue'),
  },
]

export default routes
