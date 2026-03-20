import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Auth Store — Shared Cross-Cutting Concern
 *
 * This is the ONLY Pinia store in shared/.
 * It holds identity state consumed by all modules:
 * - JWT token
 * - Current user profile
 * - Current tenant context (multi-tenancy)
 * - Tenant feature flags (mirrors backend FeatureGate)
 */

// ── Types ─────────────────────────────────────────────
export interface CurrentUser {
  id: string
  email: string
  full_name: string
  role: string
}

export interface TenantInfo {
  id: string
  name: string
  features: Record<string, boolean>
}

// ── Store ─────────────────────────────────────────────
export const useAuthStore = defineStore('auth', () => {
  // ── State ──────────────────────────────────────────
  const token = ref<string | null>(localStorage.getItem('abren_token'))
  const currentUser = ref<CurrentUser | null>(null)
  const currentTenant = ref<TenantInfo | null>(null)

  // ── Computed ───────────────────────────────────────
  const isAuthenticated = computed(() => !!token.value)

  const tenantFeatures = computed(() => currentTenant.value?.features ?? {})

  // ── Actions ────────────────────────────────────────
  function setAuth(newToken: string, user: CurrentUser, tenant: TenantInfo) {
    token.value = newToken
    currentUser.value = user
    currentTenant.value = tenant
    localStorage.setItem('abren_token', newToken)
    localStorage.setItem('abren_tenant_id', tenant.id)
  }

  function hasFeature(feature: string): boolean {
    return tenantFeatures.value[feature] === true
  }

  function logout() {
    token.value = null
    currentUser.value = null
    currentTenant.value = null
    localStorage.removeItem('abren_token')
    localStorage.removeItem('abren_tenant_id')
  }

  function $reset() {
    logout()
  }

  return {
    // State
    token,
    currentUser,
    currentTenant,
    // Computed
    isAuthenticated,
    tenantFeatures,
    // Actions
    setAuth,
    hasFeature,
    logout,
    $reset,
  }
})
