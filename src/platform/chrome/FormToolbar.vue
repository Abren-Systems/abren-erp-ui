<script setup lang="ts">
/**
 * FormToolbar — Platform chrome for the form command toolbar.
 *
 * Renders:
 * 1. Standard buttons (Save, Cancel) — implicitly injected
 * 2. Record navigation (First, Prev, Next, Last) — hidden when isNew
 * 3. Expected Next Action — highlighted primary button
 * 4. Toolbar favorites — commands with displayOnMainToolbar
 * 5. More Menu trigger — opens MoreMenu overlay
 *
 * The toolbar is entirely data-driven by the screen's ScreenCommand[]
 * declarations and the controller's command registry.
 */
import { computed, ref } from 'vue'
import { AppButton } from '@/shared/components/primitives'
import { Save, X, ChevronFirst, ChevronLeft, ChevronRight, ChevronLast } from 'lucide-vue-next'
import MoreMenu from './MoreMenu.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import type { ScreenCommand } from '../commands/command.types'
import { isCommandVisible, getExpectedNextAction } from '../commands/command.types'
import type { ControllerCommand } from '../screen-runtime/useScreenController'

const props = defineProps<{
  /** All commands declared for this screen */
  commands: readonly ScreenCommand[]
  /** Current domain status — drives visibility/enablement */
  domainState: string
  /** Registered command executors from the controller */
  executors: Record<string, ControllerCommand>
  /** Whether any command is currently executing */
  isPending: boolean
  /** Whether the record is new (hides navigation) */
  isNew: boolean
  /** Whether the record is editable according to the ScreenStatePolicy */
  isEditable: boolean
  /** Backend-provided available actions for workflow */
  availableActions?: readonly string[]
}>()

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'cancel'): void
}>()

// ── Expected Next Action ──
const expectedNext = computed(() =>
  getExpectedNextAction(props.commands, props.domainState, props.availableActions),
)

// ── Toolbar Favorites (commands shown directly on toolbar) ──
const toolbarCommands = computed(() =>
  props.commands.filter(
    (cmd) =>
      cmd.displayOnMainToolbar &&
      isCommandVisible(cmd, props.domainState, props.availableActions) &&
      cmd.key !== expectedNext.value?.key,
  ),
)

// ── Confirmation State ──
const confirmState = ref<{ open: boolean; command: ScreenCommand | null }>({
  open: false,
  command: null,
})

function executeCommand(command: ScreenCommand) {
  if (props.isPending) return

  if (command.requiresConfirmation) {
    confirmState.value = { open: true, command }
  } else {
    const executor = props.executors[command.key]
    if (executor) void executor.execute()
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

function getButtonVariant(cmd: ScreenCommand) {
  if (cmd.variant === 'danger') return 'stealth'
  if (cmd.variant === 'neutral') return 'outline'
  return 'secondary'
}
</script>

<template>
  <div class="form-toolbar">
    <!-- Standard Buttons (implicitly injected by platform) -->
    <div class="form-toolbar__standard">
      <AppButton
        variant="outline"
        size="sm"
        :disabled="isPending || !isEditable"
        @click="emit('save')"
      >
        <Save :size="14" class="mr-1.5" />
        Save
      </AppButton>
      <AppButton variant="stealth" size="sm" :disabled="isPending" @click="emit('cancel')">
        <X :size="14" class="mr-1.5" />
        Cancel
      </AppButton>
    </div>

    <!-- Record Navigation (hidden when new) -->
    <div v-if="!isNew" class="form-toolbar__nav">
      <div class="form-toolbar__nav-divider" />
      <button class="form-toolbar__nav-btn" disabled aria-label="First record">
        <ChevronFirst :size="14" />
      </button>
      <button class="form-toolbar__nav-btn" disabled aria-label="Previous record">
        <ChevronLeft :size="14" />
      </button>
      <button class="form-toolbar__nav-btn" disabled aria-label="Next record">
        <ChevronRight :size="14" />
      </button>
      <button class="form-toolbar__nav-btn" disabled aria-label="Last record">
        <ChevronLast :size="14" />
      </button>
    </div>

    <!-- Spacer -->
    <div class="form-toolbar__spacer" />

    <!-- Expected Next Action (highlighted) -->
    <AppButton
      v-if="expectedNext"
      variant="primary"
      size="sm"
      :disabled="isPending"
      class="form-toolbar__expected-next"
      @click="executeCommand(expectedNext)"
    >
      {{ expectedNext.labelKey }}
    </AppButton>

    <!-- Toolbar Favorites -->
    <AppButton
      v-for="cmd in toolbarCommands"
      :key="cmd.key"
      :variant="getButtonVariant(cmd)"
      size="sm"
      :disabled="isPending"
      :class="
        cmd.variant === 'danger'
          ? 'text-[var(--color-danger-600)] hover:bg-[var(--color-danger-50)]'
          : ''
      "
      @click="executeCommand(cmd)"
    >
      {{ cmd.labelKey }}
    </AppButton>

    <!-- More Menu -->
    <MoreMenu
      :commands="commands"
      :domain-state="domainState"
      :executors="executors"
      :is-pending="isPending"
      :available-actions="availableActions"
    />

    <!-- Confirmation Dialog for toolbar commands -->
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
.form-toolbar {
  display: flex;
  align-items: center;
  padding: 0.375rem 1.5rem;
  border-bottom: 1px solid var(--color-neutral-200);
  background: white;
  gap: 0.375rem;
  min-height: 2.5rem;
}

.form-toolbar__standard {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.form-toolbar__nav {
  display: flex;
  align-items: center;
  gap: 0.125rem;
}

.form-toolbar__nav-divider {
  width: 1px;
  height: 1.25rem;
  background: var(--color-neutral-200);
  margin: 0 0.375rem;
}

.form-toolbar__nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.25rem;
  border: none;
  background: transparent;
  color: var(--color-neutral-400);
  cursor: not-allowed;
  transition: all 0.1s ease;
}

.form-toolbar__nav-btn:not(:disabled) {
  color: var(--color-neutral-500);
  cursor: pointer;
}

.form-toolbar__nav-btn:not(:disabled):hover {
  background: var(--color-neutral-100);
  color: var(--color-neutral-900);
}

.form-toolbar__spacer {
  flex: 1;
}

.form-toolbar__expected-next {
  font-weight: 600;
}
</style>
