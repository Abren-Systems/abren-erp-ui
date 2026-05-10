<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/shared/auth/auth.store'
import type {
  WorkspaceDefinition,
  WorkspaceRuntimeContext,
} from '../navigation-runtime/workspace-definition'
import { resolveWorkspaceProjection } from '../navigation-runtime/resolve-workspace-model'
import WorkspaceRenderer from '../chrome/workspace/WorkspaceRenderer.vue'

const props = defineProps<{
  workspace: WorkspaceDefinition
}>()

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
</script>

<template>
  <WorkspaceRenderer :model="projection" />
</template>
