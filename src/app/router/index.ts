import { createRouter, createWebHistory } from 'vue-router'
import { modules } from '@/modules'
import { authGuard } from './guards'

/**
 * Central Route Aggregator
 *
 * This router handles the high-level layout switching.
 * Individual module routes are registered dynamically or spread
 * into the children array.
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: () => import('../layouts/PublicLayout.vue'),
      children: [
        {
          path: '',
          name: 'LoginPage',
          component: () => import('@/modules/identity/pages/LoginPage.vue'),
        },
      ],
    },
    {
      path: '/app',
      component: () => import('../layouts/AuthenticatedLayout.vue'),
      beforeEnter: [authGuard],
      children: [
        {
          path: '',
          name: 'DashboardPage',
          component: () => import('@/modules/identity/pages/DashboardPage.vue'),
        },
        // Dynamically register module routes
        ...await Promise.all(modules.map(m => m.routes().catch(() => []))).then(r => r.flat()),
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/app',
    },
  ],
})

export { router }
