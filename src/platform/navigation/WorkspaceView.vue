<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/shared/auth/auth.store'
import type { WorkspaceContract } from '@/platform/navigation/navigation.contract'
import type {
  WorkspaceDefinition,
  WorkspaceRuntimeContext,
} from '../navigation-runtime/workspace-definition'
import { resolveWorkspaceProjection } from '../navigation-runtime/resolve-workspace-model'
import WorkspaceRenderer from '../chrome/workspace/WorkspaceRenderer.vue'
import { screenRegistry } from '@/platform/screen-runtime/screen-registry'
import type { ScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { WorkspaceNavigatePayload } from '@/platform/navigation/workspace-navigate.types'

const props = defineProps<{
  workspace: WorkspaceDefinition | WorkspaceContract
}>()

const router = useRouter()
const authStore = useAuthStore()

const context = computed<WorkspaceRuntimeContext>(() => ({
  tenantId: authStore.currentTenant?.id || '',
  userId: authStore.currentUser?.id || '',
  roles: [], // Not yet fully implemented in authStore
  features: authStore.tenantFeatures,
  locale: 'en-US',
  environment: 'production',
  capabilities: Object.fromEntries(
    (authStore.currentUser?.permissions || []).map((p) => [p, true]),
  ),
}))

const projection = computed(() => resolveWorkspaceProjection(props.workspace, context.value))

async function onWorkspaceNavigate(payload: WorkspaceNavigatePayload) {
  if (payload.routeName) {
    await router.push({ name: payload.routeName })
    return
  }
  if (payload.screenId) {
    const screen = screenRegistry.get(payload.screenId as ScreenId)
    if (!screen) {
      console.warn(`[WorkspaceView] Unregistered screen id: ${payload.screenId}`)
      return
    }
    await router.push({ name: screen.route.name })
  }
}
</script>

<template>
  <WorkspaceRenderer :model="projection" @navigate="onWorkspaceNavigate" />
</template>
