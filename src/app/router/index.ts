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
          redirect: '/app/core/users',
        },
        // Dynamically register module routes
        // Dynamically register module routes (synchronous mapping, components remain lazy loaded)
        ...allModules.map((m) => ({
          path: m.id,
          meta: { title: m.name },
          component: () => import('@/shared/components/workspace/ModuleShell.vue'),
          children: m.routes,
        })),
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
