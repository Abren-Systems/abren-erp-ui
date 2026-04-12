import { ref, computed } from "vue";
import { authAdapter } from "./infrastructure/auth_adapter";
import { AuthMapper } from "./infrastructure/mappers";
import type { UserId, TenantId } from "@/shared/types/brand.types";

/**
 * Auth Store — Shared Cross-Cutting Concern
 *
 * This is the ONLY Pinia store in shared/.
 * It holds identity state consumed by all modules:
 * - Current user profile
 * - Current tenant context (multi-tenancy)
 * - Tenant feature flags (mirrors backend FeatureGate)
 */

const USER_KEY = "abren_current_user";
const TENANT_KEY = "abren_current_tenant";

function readStoredJson<T>(key: string): T | null {
  const raw = sessionStorage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    sessionStorage.removeItem(key);
    return null;
  }
}

// ── Types ─────────────────────────────────────────────
export interface CurrentUser {
  id: UserId;
  tenantId: TenantId;
  email: string;
  isActive: boolean;
  permissions: string[];
}

export interface TenantInfo {
  id: TenantId;
  name: string;
  features: Record<string, boolean>;
}

import { defineStore } from "pinia";

// ── Store ─────────────────────────────────────────────
export const useAuthStore = defineStore("auth", () => {
  // ── State ──────────────────────────────────────────
  // ── State ──────────────────────────────────────────
  const currentUser = ref<CurrentUser | null>(
    readStoredJson<CurrentUser>(USER_KEY),
  );
  const currentTenant = ref<TenantInfo | null>(
    readStoredJson<TenantInfo>(TENANT_KEY),
  );

  // ── Computed ───────────────────────────────────────
  const isAuthenticated = computed(() => !!currentUser.value);
  const hasSessionContext = computed(
    () => !!currentUser.value && !!currentTenant.value,
  );
  const tenantFeatures = computed(() => currentTenant.value?.features ?? {});

  // ── Actions ────────────────────────────────────────
  function persistState() {
    if (currentUser.value) {
      sessionStorage.setItem(USER_KEY, JSON.stringify(currentUser.value));
    } else {
      sessionStorage.removeItem(USER_KEY);
    }

    if (currentTenant.value) {
      sessionStorage.setItem(TENANT_KEY, JSON.stringify(currentTenant.value));
    } else {
      sessionStorage.removeItem(TENANT_KEY);
    }
  }

  function setSession(user: CurrentUser, tenant: TenantInfo) {
    currentUser.value = user;
    currentTenant.value = tenant;
    persistState();
  }

  function hasFeature(feature: string): boolean {
    return tenantFeatures.value[feature] === true;
  }

  function hasPermission(permission: string): boolean {
    return currentUser.value?.permissions?.includes(permission) ?? false;
  }

  async function hydrateSession(): Promise<boolean> {
    try {
      const [userProfileDTO, tenantDTO] = await Promise.all([
        authAdapter.getCurrentUser(),
        authAdapter.getCurrentTenant(),
      ]);

      currentUser.value = AuthMapper.toCurrentUser(userProfileDTO);
      currentTenant.value = AuthMapper.toTenantInfo(tenantDTO);
      persistState();
      return true;
    } catch {
      logout();
      return false;
    }
  }

  async function login(email: string, password: string): Promise<void> {
    await authAdapter.login(email, password);

    const hydrated = await hydrateSession();
    if (!hydrated) {
      throw new Error("Authenticated, but failed to load the user session.");
    }
  }

  function logout() {
    currentUser.value = null;
    currentTenant.value = null;
    persistState();
  }

  function $reset() {
    logout();
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
    hasPermission,
    logout,
    $reset,
  };
});
