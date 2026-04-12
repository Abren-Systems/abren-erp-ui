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
          component: () => import('@/modules/core/ui/pages/LoginPage.vue'),
        },
      ],
    },
    {
      path: '/app',
      component: () => import('../layouts/AuthenticatedLayout.vue'),
      children: [
        {
          path: '',
          name: 'DashboardPage',
          component: () => import('@/modules/core/ui/pages/DashboardPage.vue'),
        },
        // Dynamically register module routes
        // Dynamically register module routes (synchronous mapping, components remain lazy loaded)
        ...allModules.flatMap((m) => {
          return m.routes.map((r) => ({
            ...r,
            path: `${m.id}/${r.path}`.replace(/\/+/g, '/'),
          }))
        }),
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/app',
    },
  ],
})

router.beforeEach(authGuard)

export { router }
