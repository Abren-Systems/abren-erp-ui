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
    name: 'core.users',
    component: () => import('./ui/pages/UsersPage.vue'),
  },
  {
    path: '/roles',
    name: 'core.roles',
    component: () => import('./ui/pages/RolesListPage.vue'),
  },
]

export default routes
