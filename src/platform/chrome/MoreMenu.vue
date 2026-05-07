<script setup lang="ts">
/**
 * MoreMenu — Categorized command overflow menu.
 *
 * Renders all screen commands organized by category with:
 * - Green dot (●) for the expected next action
 * - Star icon (★) for favorite-eligible commands
 * - Greyed-out rendering for commands not available in current state
 * - Confirmation trigger for destructive commands
 */
import { ref, computed } from 'vue'
import { AppButton } from '@/shared/components/primitives'
import { MoreHorizontal } from 'lucide-vue-next'
import ConfirmDialog from './ConfirmDialog.vue'
import type { ScreenCommand } from '../commands/command.types'
import type { CommandProjection } from '../screen-runtime/screen-model.types'
import type { ControllerCommand } from '../screen-runtime/useScreenController'

const props = defineProps<{
  /** Secondary command projections from the unified model */
  secondaryActions: readonly CommandProjection[]
  /** Expected next action from model (for green dot rendering) */
  expectedNext?: CommandProjection
  /** Registered command executors from the controller */
  executors: Record<string, ControllerCommand>
  /** Whether any command is currently executing */
  isPending: boolean
}>()

const isOpen = ref(false)

// UI-owned visual grouping by categoryKey
const groups = computed(() => {
  const map = new Map<string, CommandProjection[]>()
  for (const cp of props.secondaryActions) {
    const category = cp.command.categoryKey ?? 'other'
    if (!map.has(category)) map.set(category, [])
    map.get(category)!.push(cp)
  }
  return map
})

const CATEGORY_LABELS: Record<string, string> = {
  processing: 'Processing',
  activities: 'Activities',
  creation: 'Record Creation',
  other: 'Other',
}

// ── Confirmation State ──
const confirmState = ref<{ open: boolean; command: ScreenCommand | null }>({
  open: false,
  command: null,
})

function executeCommand(command: ScreenCommand) {
  if (props.isPending) return

  if (command.requiresConfirmation) {
    confirmState.value = { open: true, command }
    isOpen.value = false
  } else {
    const executor = props.executors[command.key]
    if (executor) void executor.execute()
    isOpen.value = false
  }
}

function confirmExecution() {
  const cmd = confirmState.value.command
  if (cmd) {
    const executor = props.executors[cmd.key]
    if (executor) void executor.execute()
  }
  confirmState.value = { open: false, command: null }
}

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function closeMenu() {
  isOpen.value = false
}
</script>

<template>
  <div class="more-menu" v-click-outside="closeMenu">
    <AppButton
      variant="outline"
      size="sm"
      class="more-menu__trigger"
      @click="toggleMenu"
      aria-label="More actions"
    >
      <MoreHorizontal :size="16" />
    </AppButton>

    <Transition name="more-menu-fade">
      <div v-if="isOpen" class="more-menu__panel">
        <template v-for="[category, cps] in groups" :key="category">
          <div class="more-menu__category">
            <span class="more-menu__category-title">
              {{ CATEGORY_LABELS[category] ?? category }}
            </span>
            <button
              v-for="cp in cps"
              :key="cp.command.key"
              class="more-menu__item"
              :class="{
                'more-menu__item--disabled': !cp.enabled || isPending,
                'more-menu__item--danger': cp.command.variant === 'danger',
              }"
              :disabled="!cp.enabled || isPending"
              @click="executeCommand(cp.command)"
            >
              <span
                v-if="expectedNext?.command.key === cp.command.key"
                class="more-menu__expected-dot"
                title="Expected next action"
                >●</span
              >
              <span v-else class="more-menu__dot-spacer" />

              <span class="more-menu__item-label">{{ cp.command.labelKey }}</span>

              <span
                v-if="cp.command.favoriteEligible"
                class="more-menu__favorite"
                title="Add to toolbar favorites"
                >★</span
              >
            </button>
          </div>
        </template>

        <div v-if="groups.size === 0" class="more-menu__empty">No actions available</div>
      </div>
    </Transition>

    <!-- Confirmation Dialog -->
    <ConfirmDialog
      v-model:open="confirmState.open"
      :title="confirmState.command ? `Confirm ${confirmState.command.labelKey}` : 'Confirm'"
      :description="
        confirmState.command?.confirmationMessageKey ?? 'Are you sure you want to proceed?'
      "
      :variant="confirmState.command?.variant === 'danger' ? 'danger' : 'primary'"
      :loading="isPending"
      @confirm="confirmExecution"
    />
  </div>
</template>

<style scoped>
.more-menu {
  position: relative;
}

.more-menu__trigger {
  padding: 0.25rem 0.5rem;
}

.more-menu__panel {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 14rem;
  max-width: 20rem;
  background: white;
  border: 1px solid var(--color-neutral-200);
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
  z-index: 50;
  padding: 0.25rem 0;
}

.more-menu__category {
  padding: 0.25rem 0;
}

.more-menu__category:not(:first-child) {
  border-top: 1px solid var(--color-neutral-100);
}

.more-menu__category-title {
  display: block;
  padding: 0.375rem 0.75rem 0.25rem;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-neutral-400);
}

.more-menu__item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.4375rem 0.75rem;
  border: none;
  background: transparent;
  font-size: 0.8125rem;
  color: var(--color-neutral-700);
  cursor: pointer;
  text-align: left;
  gap: 0.5rem;
  transition: background 0.1s ease;
}

.more-menu__item:hover:not(:disabled) {
  background: var(--color-neutral-50);
}

.more-menu__item--disabled {
  color: var(--color-neutral-400);
  cursor: not-allowed;
}

.more-menu__item--danger:not(.more-menu__item--disabled) {
  color: var(--color-danger-600);
}

.more-menu__item--danger:hover:not(:disabled) {
  background: var(--color-danger-50, #fef2f2);
}

.more-menu__expected-dot {
  color: var(--color-success-500);
  font-size: 0.625rem;
  flex-shrink: 0;
  width: 0.75rem;
  text-align: center;
}

.more-menu__dot-spacer {
  width: 0.75rem;
  flex-shrink: 0;
}

.more-menu__item-label {
  flex: 1;
}

.more-menu__favorite {
  color: var(--color-warning-500);
  font-size: 0.75rem;
  flex-shrink: 0;
  opacity: 0.4;
  transition: opacity 0.15s ease;
}

.more-menu__item:hover .more-menu__favorite {
  opacity: 1;
}

.more-menu__empty {
  padding: 1rem;
  text-align: center;
  font-size: 0.8125rem;
  color: var(--color-neutral-400);
}

/* Transition */
.more-menu-fade-enter-active,
.more-menu-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.more-menu-fade-enter-from,
.more-menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
