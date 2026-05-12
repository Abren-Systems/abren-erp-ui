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
          component: () => import('@/shared/auth/ui/LoginPage.vue'),
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
        ...allModules.map((m) => ({
          path: m.id,
          meta: { title: m.name },
          component: () => import('@/shared/components/workspace/ModuleShell.vue'),
          children: [
            {
              path: '',
              name: `workspace.${m.id}`,
              component: () => import('@/platform/navigation/ModuleWorkspaceView.vue'),
              props: { moduleId: m.id },
            },
            ...m.routes,
          ],
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
