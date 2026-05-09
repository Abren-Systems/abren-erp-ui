<script setup lang="ts">
import { ref, computed, defineAsyncComponent, type Component } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { SidePanelContract, SidePanelTabContract } from '@/platform/component-contracts'

const props = defineProps<{
  contract: SidePanelContract
}>()

// Default to true if not specified, matching Acumatica's typical behavior
const isCollapsed = ref(props.contract.defaultCollapsed ?? true)

const activeTabId = ref<string>(props.contract.defaultTabId ?? props.contract.tabs[0]?.id ?? '')

const activeTab = computed(() => props.contract.tabs.find((t) => t.id === activeTabId.value))

// In a real app, icons would be resolved from a registry
// We'll use a simple fallback mechanism here for the proof of concept
const resolveIcon = (iconName: string) => {
  // If we had dynamic lucide imports, we'd do it here
  // For now, we'll just pass the string to a generic icon component or use a static map if needed
  return iconName
}

// Map of lazy loaded components
const tabComponents = computed<Record<string, Component>>(() => {
  const map: Record<string, Component> = {}

  for (const tab of props.contract.tabs) {
    if (tab.kind === 'local') {
      map[tab.id] = defineAsyncComponent({
        loader: tab.component as () => Promise<Component>,
        delay: 200,
        timeout: 3000,
      })
    }
  }
  return map
})

function togglePanel() {
  isCollapsed.value = !isCollapsed.value
}

function selectTab(tab: SidePanelTabContract) {
  activeTabId.value = tab.id
  if (isCollapsed.value) {
    isCollapsed.value = false
  }
}
</script>

<template>
  <div
    class="app-side-panel flex border-l border-neutral-200 bg-white transition-all duration-300 ease-in-out relative z-10"
    :class="[isCollapsed ? 'w-[48px]' : 'w-[400px]']"
  >
    <!-- Expand/Collapse Toggle -->
    <button
      class="absolute top-1/2 -left-4 w-4 h-16 bg-white border border-neutral-200 border-r-0 rounded-l flex items-center justify-center text-neutral-500 hover:text-neutral-900 shadow-[-2px_0_4px_rgba(0,0,0,0.05)] z-20 transition-colors"
      @click="togglePanel"
    >
      <ChevronRight v-if="isCollapsed" class="w-3 h-3" />
      <ChevronLeft v-else class="w-3 h-3" />
    </button>

    <!-- Content Area (Only visible when expanded) -->
    <div
      class="flex-1 overflow-hidden transition-opacity duration-200 flex flex-col"
      :class="isCollapsed ? 'opacity-0 invisible w-0' : 'opacity-100 visible'"
    >
      <!-- Panel Header -->
      <div
        class="h-14 border-b border-neutral-200 flex items-center px-4 shrink-0 bg-neutral-50/50"
      >
        <h3 class="text-sm font-semibold text-neutral-900 truncate">
          {{ activeTab?.labelKey || 'Side Panel' }}
        </h3>
      </div>

      <!-- Panel Body -->
      <div class="flex-1 overflow-y-auto">
        <template v-if="activeTab?.kind === 'local'">
          <component :is="tabComponents[activeTab.id]" v-if="tabComponents[activeTab.id]" />
        </template>

        <template v-else-if="activeTab?.kind === 'screen'">
          <!-- In Phase 4b, this would mount a nested ScreenRenderer -->
          <div class="p-6 text-center text-neutral-500 text-sm">
            Nested ScreenRenderer ({{ activeTab.screenId }}) placeholder.
          </div>
        </template>
      </div>
    </div>

    <!-- Icon Strip (Always visible on the right edge) -->
    <div
      class="w-[48px] shrink-0 border-l border-neutral-200 bg-neutral-50 flex flex-col py-2 gap-1 items-center z-10"
    >
      <button
        v-for="tab in contract.tabs"
        :key="tab.id"
        class="w-10 h-10 rounded flex items-center justify-center transition-colors group relative"
        :class="[
          activeTabId === tab.id
            ? 'bg-primary-50 text-primary-600'
            : 'text-neutral-500 hover:bg-neutral-200/50 hover:text-neutral-900',
        ]"
        @click="selectTab(tab)"
        :title="tab.labelKey"
      >
        <!-- In a real implementation, we'd render the lucide icon here based on tab.icon string -->
        <span class="text-[10px] font-bold uppercase tracking-tighter">{{
          tab.icon.substring(0, 3)
        }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 
  Acumatica-style side panel:
  - Collapses to just the icon strip
  - Has a middle-of-screen expand/collapse handle
  - Renders content in a dedicated pane next to the strip
*/
</style>
