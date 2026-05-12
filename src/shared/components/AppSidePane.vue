<script setup lang="ts">
/**
 * AppSidePane.vue
 *
 * The authoritative Right-hand service panel.
 *
 * Refined per user feedback:
 * - Removed pseudo-header (should not touch Top Pane).
 * - Collapse icon relocated to bottom of icon strip.
 * - Height contained within Working Area.
 */
import { ref, computed, inject, type Component } from 'vue'
import {
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  Paperclip,
  FileText,
  User,
  GitBranch,
} from 'lucide-vue-next'
import type { SidePanelContract, SidePanelTabContract } from '@/platform/component-contracts'

const props = defineProps<{
  contract?: SidePanelContract
}>()

interface SidePanelState {
  visible: { value: boolean }
  expanded: { value: boolean }
}

const sidePanel = inject<SidePanelState>('sidePanel')!

// Default services if no contract is provided (for demonstration/hardening)
const defaultTabs: SidePanelTabContract[] = [
  {
    id: 'activities',
    labelKey: 'Activities',
    icon: 'MessageSquare',
    kind: 'local',
    component: async () => ({}),
  },
  { id: 'files', labelKey: 'Files', icon: 'Paperclip', kind: 'local', component: async () => ({}) },
  {
    id: 'relations',
    labelKey: 'Relations',
    icon: 'GitBranch',
    kind: 'local',
    component: async () => ({}),
  },
]

const tabs = computed(() => props.contract?.tabs || defaultTabs)
const activeTabId = ref<string>(props.contract?.defaultTabId || tabs.value[0]?.id || '')
const activeTab = computed(() => tabs.value.find((t) => t.id === activeTabId.value))

// Map of icons for demonstration
const iconMap: Record<string, Component> = {
  MessageSquare,
  Paperclip,
  FileText,
  User,
  GitBranch,
}

function selectTab(tab: SidePanelTabContract) {
  activeTabId.value = tab.id
  if (!sidePanel.expanded.value) {
    sidePanel.expanded.value = true
  }
}
</script>

<template>
  <aside
    v-if="sidePanel.visible.value"
    class="side-pane mt-px flex flex-col border-l border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]"
    :class="{ 'side-pane--expanded': sidePanel.expanded.value }"
  >
    <!-- Main Content Area (No header, starts below Top Pane) -->
    <div class="flex flex-1 min-h-0 overflow-hidden">
      <!-- Expanded Content Area -->
      <div
        v-if="sidePanel.expanded.value"
        class="flex-1 overflow-y-auto p-4 animate-in slide-in-from-right-2 bg-white"
      >
        <div class="mb-6 flex items-center justify-between">
          <h3
            class="text-[11px] font-bold uppercase tracking-wider text-[var(--color-neutral-500)]"
          >
            {{ activeTab?.labelKey }}
          </h3>
        </div>

        <!-- Contextual Content Placeholders -->
        <div class="space-y-6">
          <div v-for="i in 3" :key="i" class="space-y-2">
            <div class="flex justify-between items-start">
              <p class="text-[11px] font-semibold text-[var(--color-neutral-900)]">
                Context Event #{{ 1024 + i }}
              </p>
              <span class="text-[10px] text-[var(--color-neutral-400)]">{{ i }}h ago</span>
            </div>
            <p class="text-[11px] text-[var(--color-neutral-600)] leading-relaxed">
              Automated audit capture of contextual state transition for the current record.
            </p>
            <div class="h-px w-full bg-[var(--color-neutral-100)]" />
          </div>
        </div>
        <div
          class="mt-8 rounded border border-dashed border-[var(--color-neutral-200)] p-8 text-center text-[var(--color-neutral-400)] text-xs"
        >
          End of contextual services
        </div>
      </div>

      <!-- Icon Strip (Always visible, flush right) -->
      <div
        class="w-11 shrink-0 border-l border-[var(--color-neutral-100)] flex flex-col items-center py-4 relative h-full"
      >
        <!-- Service Tabs -->
        <div class="flex flex-col gap-4 items-center flex-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="group relative flex h-10 w-10 items-center justify-center transition-all"
            :class="[
              activeTabId === tab.id
                ? 'text-[var(--color-primary-600)]'
                : 'text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-900)]',
            ]"
            @click="selectTab(tab)"
            :title="tab.labelKey"
          >
            <component :is="iconMap[tab.icon] || FileText" :size="18" />

            <div
              v-if="activeTabId === tab.id && sidePanel.expanded.value"
              class="absolute right-0 top-1 bottom-1 w-[3px] bg-[var(--color-primary-600)]"
            />
          </button>
        </div>

        <!-- Expansion Toggle (At the bottom) -->
        <button
          class="mt-auto flex h-10 w-10 items-center justify-center text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-900)] transition-colors border-t border-[var(--color-neutral-100)] pt-2"
          @click="sidePanel.expanded.value = !sidePanel.expanded.value"
          title="Toggle Expansion"
        >
          <ChevronLeft v-if="!sidePanel.expanded.value" :size="18" />
          <ChevronRight v-else :size="18" />
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.side-pane {
  width: 44px;
  min-height: 100%;
  align-self: stretch;
  transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  flex-shrink: 0;
  z-index: 10;
}

.side-pane--expanded {
  width: 300px;
}

/* 
  Acumatica-style side panel:
  - Collapses to just the icon strip
  - Has a middle-of-screen expand/collapse handle
  - Renders content in a dedicated pane next to the strip
*/
</style>
