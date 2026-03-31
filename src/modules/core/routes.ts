import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('./pages/LoginPage.vue'),
    meta: { layout: 'public' },
  },
  {
    path: '/users',
    name: 'CoreUsers',
    component: () => import('./pages/UsersPage.vue'),
  },
]

export default routes
