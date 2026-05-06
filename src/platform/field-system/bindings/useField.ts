import { computed, type ComputedRef } from 'vue'
import type { FieldDefinition } from '../field-definition.types'
import type { ScreenControllerInstance } from '@/platform/screen-runtime/useScreenController'
import type { ScreenStateMachine } from '@/platform/screen-runtime/state-machine.types'

export interface FieldBinding<TValue = unknown> {
  value: ComputedRef<TValue | undefined>
  modelValue: ComputedRef<TValue | undefined>
  label: string
  readonly: ComputedRef<boolean>
  required: ComputedRef<boolean>
  'onUpdate:modelValue': (newValue: TValue) => void
  error: ComputedRef<string | null>
  type: string
}

/**
 * useField Binding API
 *
 * Binds a formal FieldDefinition to the active ScreenController.
 * This guarantees that the View cannot mutate data independently,
 * and that all readonly/required rules are evaluated centrally by the State Machine.
 */
export function useField<TEntity, TValue>(
  controller: ScreenControllerInstance<TEntity, string>,
  definition: FieldDefinition<TEntity, TValue>,
): FieldBinding<TValue> {
  const value = controller.data.select(definition.key) as ComputedRef<TValue | undefined>

  const isReadonly = computed(() => {
    // Priority 1: Interpreted state policy (single source of truth)
    const interpreted = controller.interpretedState.value
    if (interpreted) {
      return interpreted.isFieldReadonly(String(definition.key))
    }
    // Priority 2: Field-level custom readonly function (legacy fallback)
    if (definition.readonly) {
      return definition.readonly(
        controller.state as ScreenStateMachine,
        controller.entity.value as Partial<TEntity>,
      )
    }
    return !controller.state.isEditable
  })

  const isRequired = computed(() => {
    // Priority 1: Interpreted state policy
    const interpreted = controller.interpretedState.value
    if (interpreted) {
      return interpreted.isFieldRequired(String(definition.key))
    }
    // Priority 2: Field-level custom required function (legacy fallback)
    if (definition.required) {
      return definition.required(
        controller.state as ScreenStateMachine,
        controller.entity.value as Partial<TEntity>,
      )
    }
    return false
  })

  const error = computed(() => {
    if (definition.validate && value.value !== undefined) {
      return definition.validate(
        value.value,
        controller.state as ScreenStateMachine,
        controller.entity.value as Partial<TEntity>,
      )
    }
    return null
  })

  // The view is not allowed to use v-model. It calls onChange, which routes through the controller.
  const onChange = (newValue: TValue) => {
    if (isReadonly.value) return // Block mutation if State Machine forbids it

    // Optimistic update - in a full implementation, the controller would handle this via a command
    // or TanStack Form's mutator methods.
    if (controller.isNew.value && 'form' in controller) {
      // If there is a form instance (e.g. TanStack form) attached to the controller:
      const formControl = (
        controller as unknown as { form: { setFieldValue: (k: keyof TEntity, v: TValue) => void } }
      ).form
      formControl.setFieldValue(definition.key, newValue)
    } else {
      console.warn(
        `Controller mutation not fully implemented for ${String(definition.key)}. Use the form directly or implement mutation actions.`,
      )
    }
  }

  return {
    value,
    modelValue: value,
    label: definition.label,
    readonly: isReadonly,
    required: isRequired,
    'onUpdate:modelValue': onChange,
    error,
    type: definition.type,
  }
}
