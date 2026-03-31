import { computed } from 'vue'
import { useAuthStore } from '../auth/auth.store'
import { useRouter } from 'vue-router'

/**
 * Feature Gate Composable
 *
 * Mirrors the backend's FeatureGate dependency.
 * Checks if a feature is enabled for the current tenant.
 *
 * Usage:
 *   const { isEnabled, guardRoute } = useFeatureGate('webhooks')
 *   if (!isEnabled.value) {  // hide UI  }
 */
export function useFeatureGate(feature: string) {
  const authStore = useAuthStore()
  const router = useRouter()

  const isEnabled = computed(() => authStore.hasFeature(feature))

  function guardRoute(): boolean {
    if (!isEnabled.value) {
      void router.push({ name: 'feature-disabled', params: { feature } })
      return false
    }
    return true
  }

  return { isEnabled, guardRoute }
}
