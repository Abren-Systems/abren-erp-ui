import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
// ── Store ─────────────────────────────────────────────
export const useAuthStore = defineStore('auth', () => {
    // ── State ──────────────────────────────────────────
    const token = ref(localStorage.getItem('abren_token'));
    const currentUser = ref(null);
    const currentTenant = ref(null);
    // ── Computed ───────────────────────────────────────
    const isAuthenticated = computed(() => !!token.value);
    const tenantFeatures = computed(() => currentTenant.value?.features ?? {});
    // ── Actions ────────────────────────────────────────
    function setAuth(newToken, user, tenant) {
        token.value = newToken;
        currentUser.value = user;
        currentTenant.value = tenant;
        localStorage.setItem('abren_token', newToken);
        localStorage.setItem('abren_tenant_id', tenant.id);
    }
    function hasFeature(feature) {
        return tenantFeatures.value[feature] === true;
    }
    function logout() {
        token.value = null;
        currentUser.value = null;
        currentTenant.value = null;
        localStorage.removeItem('abren_token');
        localStorage.removeItem('abren_tenant_id');
    }
    function $reset() {
        logout();
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
    };
});
