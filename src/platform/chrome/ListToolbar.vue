<script setup lang="ts">
/**
 * ListToolbar — Platform chrome for the list screen action bar.
 *
 * Renders Row 2 of a list screen:
 * - High-frequency actions (New, Edit, Delete, Refresh) as icon buttons
 * - Custom commands with displayOnMainToolbar
 * - More Menu for overflow
 *
 * This separates Commands (Row 2) from View Controls (Row 3).
 */
import { AppButton } from '@/shared/components/primitives'
import type { Component } from 'vue'
import { Plus, Edit, Trash2, RefreshCcw, MoreHorizontal } from 'lucide-vue-next'
import type { ScreenProjection, CommandProjection } from '../screen-runtime/screen-projection.types'
import type { ControllerCommand } from '../screen-runtime/useScreenController'
import MoreMenu from './MoreMenu.vue'

const props = defineProps<{
  model: ScreenProjection
  executors: Record<string, ControllerCommand>
  isPending: boolean
}>()

// ── Icons ──
const iconMap: Record<string, Component> = {
  create: Plus,
  edit: Edit,
  delete: Trash2,
  refresh: RefreshCcw,
}

function executeCommand(cp: CommandProjection) {
  if (props.isPending || !cp.enabled) return
  const executor = props.executors[cp.command.key]
  if (executor) void executor.execute()
}

function getIcon(key: string) {
  return iconMap[key] || null
}
</script>

<template>
  <div class="list-toolbar">
    <!-- Action Icons -->
    <div class="list-toolbar__actions">
      <template v-for="cp in model.ui.actions.primary" :key="cp.command.key">
        <AppButton
          variant="stealth"
          size="sm"
          :disabled="isPending || !cp.enabled"
          :title="cp.command.labelKey"
          class="px-2"
          @click="executeCommand(cp)"
        >
          <component :is="getIcon(cp.command.key)" v-if="getIcon(cp.command.key)" :size="16" />
          <span v-else>{{ cp.command.labelKey }}</span>
        </AppButton>
      </template>
    </div>

    <!-- More Menu (Overflow) -->
    <div class="list-toolbar__overflow">
      <MoreMenu
        :secondary-actions="model.ui.actions.secondary"
        :executors="executors"
        :is-pending="isPending"
      />
    </div>
  </div>
</template>

<style scoped>
.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--layout-gutter);
  height: var(--chrome-toolbar-min-h);
  border-bottom: 1px solid var(--color-neutral-200);
  background: white;
  min-height: 2.25rem; /* 36px */
}

.list-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.list-toolbar__overflow {
  margin-left: auto;
}
</style>
