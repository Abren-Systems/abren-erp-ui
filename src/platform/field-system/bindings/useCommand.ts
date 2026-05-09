import { computed, type ComputedRef } from 'vue'
import type { ScreenController } from '@/platform/screen-runtime/screen-controller.types'
import type { CommandProjection } from '@/platform/screen-runtime/screen-model.types'
import type { ScreenCommand } from '@/platform/commands/command.types'

export interface CommandBinding {
  readonly command: ScreenCommand | undefined
  readonly visible: ComputedRef<boolean>
  readonly enabled: ComputedRef<boolean>
  readonly reason: ComputedRef<string | undefined>
  readonly execute: () => void | Promise<void>
}

/**
 * useCommand Binding API
 *
 * Binds a command ID to the active ScreenController's model projection.
 * This guarantees that UI buttons strictly follow the state machine's rules
 * (visibility, enabled state) deterministically.
 */
export function useCommand<TEntity>(
  controller: ScreenController<TEntity, string>,
  commandId: string,
): CommandBinding {
  // Find the projection for this command from the model's primary or secondary actions
  const projection = computed<CommandProjection | undefined>(() => {
    const actions = controller.model.value.ui.actions
    return (
      actions.primary.find((p) => p.command.key === commandId) ||
      actions.secondary.find((p) => p.command.key === commandId)
    )
  })

  const visible = computed(() => projection.value?.visible ?? false)
  const enabled = computed(() => projection.value?.enabled ?? false)
  const reason = computed(() => projection.value?.reason)

  // Map back to the controller's executable command list
  const execute = () => {
    if (!enabled.value) return
    const cmd = controller.commands.value[commandId]
    if (cmd) {
      void cmd.execute()
    } else {
      console.warn(
        `[useCommand] Command '${commandId}' was projected but has no executable implementation in the controller.`,
      )
    }
  }

  return {
    command: projection.value?.command,
    visible,
    enabled,
    reason,
    execute,
  }
}
