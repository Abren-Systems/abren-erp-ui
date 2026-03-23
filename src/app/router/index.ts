import { createRouter, createWebHistory } from 'vue-router'
import { allModules } from '@/modules'
import { authGuard } from './guards'

/**
 * Central Route Aggregator
 *
 * This router handles the high-level layout switching.
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
          component: () => import('@/modules/platform/core/pages/LoginPage.vue'),
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
          component: () => import('@/modules/platform/core/pages/DashboardPage.vue'),
        },
        // Dynamically register module routes
        ...(await Promise.all(
          allModules.map(async (m) => {
            const routes = await m.routes()
            // Optional: prefix routes with module ID for isolation
            return routes.map((r) => ({
              ...r,
              path: `${m.id}/${r.path}`.replace(/\/+/g, '/'),
            }))
          }),
        ).then((r) => r.flat())),
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/app',
    },
  ],
})

export { router }
