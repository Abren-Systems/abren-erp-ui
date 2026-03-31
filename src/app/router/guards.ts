import type { NavigationGuardWithThis } from 'vue-router'
import { useAuthStore } from '@/shared/auth/auth.store'

/**
 * authGuard
 *
 * Prevents unauthenticated users from accessing protected routes.
 * Redirects to /login if no session is active.
 */
export const authGuard: NavigationGuardWithThis<undefined> = async (to) => {
  const authStore = useAuthStore()
  const isAppRoute = to.path.startsWith('/app')
  const isLoginRoute = to.path === '/login'

  if (authStore.isAuthenticated && !authStore.hasSessionContext) {
    await authStore.hydrateSession()
  }

  if (isAppRoute && (!authStore.isAuthenticated || !authStore.hasSessionContext)) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }

  if (isLoginRoute && authStore.isAuthenticated && authStore.hasSessionContext) {
    return { path: '/app' }
  }

  return true
}
