import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiGet, httpClient, type ApiResponse } from '@/shared/api/http-client'

/**
 * Auth Store — Shared Cross-Cutting Concern
 *
 * This is the ONLY Pinia store in shared/.
 * It holds identity state consumed by all modules:
 * - Current user profile
 * - Current tenant context (multi-tenancy)
 * - Tenant feature flags (mirrors backend FeatureGate)
 */

const USER_KEY = 'abren_current_user'
const TENANT_KEY = 'abren_current_tenant'

function readStoredJson<T>(key: string): T | null {
  const raw = sessionStorage.getItem(key)
  if (!raw) return null

  try {
    return JSON.parse(raw) as T
  } catch {
    sessionStorage.removeItem(key)
    return null
  }
}

// ── Types ─────────────────────────────────────────────
export interface CurrentUser {
  id: string
  tenantId: string
  email: string
  isActive: boolean
}

export interface TenantInfo {
  id: string
  name: string
  features: Record<string, boolean>
}

// The backend sets HttpOnly cookies containing the access/refresh tokens.
// No physical token string is returned to the javascript client.
interface LoginResponse {
  message?: string
}

interface UserProfileResponse {
  id: string
  tenant_id: string
  email: string
  is_active: boolean
}

// ── Store ─────────────────────────────────────────────
export const useAuthStore = defineStore('auth', () => {
  // ── State ──────────────────────────────────────────
  // ── State ──────────────────────────────────────────
  const currentUser = ref<CurrentUser | null>(readStoredJson<CurrentUser>(USER_KEY))
  const currentTenant = ref<TenantInfo | null>(readStoredJson<TenantInfo>(TENANT_KEY))

  // ── Computed ───────────────────────────────────────
  const isAuthenticated = computed(() => !!currentUser.value)
  const hasSessionContext = computed(() => !!currentUser.value && !!currentTenant.value)
  const tenantFeatures = computed(() => currentTenant.value?.features ?? {})

  // ── Actions ────────────────────────────────────────
  function persistState() {
    if (currentUser.value) {
      sessionStorage.setItem(USER_KEY, JSON.stringify(currentUser.value))
    } else {
      sessionStorage.removeItem(USER_KEY)
    }

    if (currentTenant.value) {
      sessionStorage.setItem(TENANT_KEY, JSON.stringify(currentTenant.value))
    } else {
      sessionStorage.removeItem(TENANT_KEY)
    }
  }

  function setSession(user: CurrentUser, tenant: TenantInfo) {
    currentUser.value = user
    currentTenant.value = tenant
    persistState()
  }

  function hasFeature(feature: string): boolean {
    return tenantFeatures.value[feature] === true
  }

  async function hydrateSession(): Promise<boolean> {
    try {
      const [userProfile, tenant] = await Promise.all([
        apiGet<UserProfileResponse>('/core/users/me'),
        apiGet<TenantInfo>('/core/tenants/current'),
      ])

      currentUser.value = {
        id: userProfile.id,
        tenantId: userProfile.tenant_id,
        email: userProfile.email,
        isActive: userProfile.is_active,
      }
      currentTenant.value = tenant
      persistState()
      return true
    } catch {
      logout()
      return false
    }
  }

  async function login(email: string, password: string): Promise<void> {
    const formData = new URLSearchParams()
    formData.set('username', email)
    formData.set('password', password)

    await httpClient.post<ApiResponse<LoginResponse>>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    const hydrated = await hydrateSession()
    if (!hydrated) {
      throw new Error('Authenticated, but failed to load the user session.')
    }
  }

  function logout() {
    currentUser.value = null
    currentTenant.value = null
    persistState()
  }

  function $reset() {
    logout()
  }

  return {
    // State
    currentUser,
    currentTenant,
    // Computed
    isAuthenticated,
    hasSessionContext,
    tenantFeatures,
    // Actions
    setSession,
    hydrateSession,
    login,
    hasFeature,
    logout,
    $reset,
  }
})
