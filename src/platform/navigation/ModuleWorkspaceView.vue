<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { workspaceRegistry } from '@/platform/navigation-runtime/workspace-registry'
import type { WorkspaceId } from '@/platform/navigation-runtime/workspace-definition'
import WorkspaceView from './WorkspaceView.vue'

const props = defineProps<{
  moduleId: string
}>()

const workspace = computed(() => {
  return workspaceRegistry.get(props.moduleId as WorkspaceId)
})
</script>

<template>
  <div v-if="workspace">
    <WorkspaceView :workspace="workspace" />
  </div>
  <div v-else class="flex h-64 items-center justify-center text-neutral-500">
    Workspace not found for module: {{ moduleId }}
  </div>
</template>
