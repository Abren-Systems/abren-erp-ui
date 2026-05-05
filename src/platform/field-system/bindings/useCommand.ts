import { computed, type ComputedRef } from 'vue'
import type { ScreenCommand } from '@/platform/commands/command.types'
import type { ScreenControllerInstance } from '@/platform/screen-runtime/useScreenController'
import type { CommandEffects } from '@/platform/commands/command.types'

export interface CommandBinding {
  isVisible: ComputedRef<boolean>
  isEnabled: ComputedRef<boolean>
  isPending: ComputedRef<boolean>
  execute: () => Promise<void>
}

/**
 * useCommand Binding API
 *
 * Binds a formal ScreenCommand to the UI.
 * Enforces `from` state transitions and passes execution to the Controller.
 */
export function useCommand<TEntity>(
  controller: ScreenControllerInstance<TEntity>,
  command: ScreenCommand<TEntity>,
): CommandBinding {
  const isVisible = computed(() => {
    return command.isVisible(controller.state)
  })

  const isEnabled = computed(() => {
    // 1. Workflow state machine check
    if (command.from && command.from.length > 0) {
      if (!command.from.includes(controller.state.domain)) return false
    }

    // 2. Business logic predicate check
    return command.isEnabled(controller.state, controller.data)
  })

  // Check if this specific command is pending in the controller's registry
  const isPending = computed(() => {
    return controller.commands.value[command.id]?.isPending.value ?? false
  })

  const execute = async () => {
    if (!isEnabled.value) {
      console.warn(`Command ${command.id} execution blocked by state machine constraints.`)
      return
    }

    // A real implementation would wire up actual effects (toast, router, etc.)
    const effects: CommandEffects = {
      run: async (fn) => await fn(),
      notifySuccess: (msg) => console.log('SUCCESS:', msg),
      notifyError: (msg, err) => console.error('ERROR:', msg, err),
    }

    await command.execute(
      controller as unknown as import('@/platform/screen-runtime/screen-controller.types').ScreenController<TEntity>,
      effects,
    )

    if (command.to) {
      controller.state.transitionDomain(
        command.to as import('@/platform/screen-runtime').DomainState,
      )
    }
  }

  return {
    isVisible,
    isEnabled,
    isPending,
    execute,
  }
}
