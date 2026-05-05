<script setup lang="ts">
import { computed, defineAsyncComponent, provide, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { screenRegistry } from './screen-registry'
import { AppSidePanel } from '@/shared/components/workspace'
import type { ScreenDefinition } from './screen-definition.types'
import type { ScreenId } from './screen-id.types'

const props = defineProps<{
  id?: string // E.g., 'new', or UUID from router params
}>()

const route = useRoute()

// Resolve the screen definition from the router meta
const screenId = computed(() => route.meta.screenId as string)
const screen = computed(
  () => screenRegistry.get(screenId.value as ScreenId) as ScreenDefinition | undefined,
)

// Resolve the Working Area view component (currently from renderTarget,
// eventually this will resolve dynamically from views contract)
const WorkingArea = computed(() => {
  if (!screen.value?.layout.renderTarget) return null
  return screen.value.layout.renderTarget
})

// Extract the side panel contract if defined
const sidePanelContract = computed(() => {
  return screen.value?.layout?.sidePanel
})
</script>

<template>
  <div v-if="screen" class="flex w-full h-full relative overflow-hidden bg-neutral-50/30">
    <div class="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
      <KeepAlive :max="10">
        <component :is="WorkingArea" v-if="WorkingArea" :key="props.id || 'new'" :id="props.id" />
      </KeepAlive>
      <div v-if="!WorkingArea" class="flex items-center justify-center h-full text-neutral-400">
        No working area defined for {{ screen.id }}
      </div>
    </div>

    <!-- Platform Side Panel -->
    <AppSidePanel v-if="sidePanelContract" :contract="sidePanelContract" />
  </div>
  <div v-else class="flex items-center justify-center h-full text-danger-500 font-medium">
    Screen Definition Not Found: {{ screenId }}
  </div>
</template>
