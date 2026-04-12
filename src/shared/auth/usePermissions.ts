import { useAuthStore } from './auth.store'

/**
 * usePermissions — RBAC Guard Composable
 *
 * Provides a localized, reactivity-safe mechanism for evaluating user scopes.
 * Intended for use in View components (`v-if="hasPermission(...)"`) and
 * Route guards.
 */
export function usePermissions() {
  const authStore = useAuthStore()

  /**
   * Checks if the active user possesses a specific backend permission.
   *
   * @param permission - The exact permission string (e.g. 'ledger:create_entry')
   * @returns boolean
   */
  const hasPermission = (permission: string): boolean => {
    return authStore.hasPermission(permission)
  }

  /**
   * Checks if the active user possesses AT LEAST ONE of the listed permissions.
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(hasPermission)
  }

  /**
   * Checks if the active user possesses ALL of the listed permissions.
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(hasPermission)
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  }
}
