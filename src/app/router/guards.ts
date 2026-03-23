import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

/**
 * authGuard
 *
 * Prevents unauthenticated users from accessing protected routes.
 * Redirects to /login if no session is active.
 */
export async function authGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  // TODO: Connect to useAuthStore()
  const isAuthenticated = true // Mocked for now

  if (to.path.startsWith('/app') && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/app')
  } else {
    next()
  }
}
