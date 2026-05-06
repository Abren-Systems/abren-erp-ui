import { computed, type ComputedRef } from 'vue'
import type { FieldDefinition } from '../field-definition.types'
import type { ScreenControllerInstance } from '@/platform/screen-runtime/useScreenController'
import type { ScreenStateMachine } from '@/platform/screen-runtime/state-machine.types'
import { debugBus } from '@/platform/debug/debug-bus'

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

    const fieldKey = definition.key
    const previousValue = value.value

    // Route 1: New record — write to the attached form instance
    if (controller.isNew.value && 'form' in controller) {
      const formControl = (
        controller as unknown as { form: { setFieldValue: (k: keyof TEntity, v: TValue) => void } }
      ).form
      formControl.setFieldValue(fieldKey, newValue)
    }
    // Route 2: Edit mode — write through controller's setFieldValue if available
    else if ('setFieldValue' in controller) {
      const mutator = controller as unknown as {
        setFieldValue: (k: keyof TEntity, v: TValue) => void
      }
      mutator.setFieldValue(fieldKey, newValue)
    }
    // Route 3: No mutation path available — warn (should not happen in production)
    else {
      console.warn(
        `[useField] No mutation path for field "${String(fieldKey)}". ` +
          `Attach a form instance or implement setFieldValue on the controller.`,
      )
      return // Don't emit debug event for failed mutations
    }

    // Emit debug event for successful mutations
    debugBus.emit(controller.screen.id, 'field_mutation', {
      field: String(fieldKey),
      previousValue,
      newValue,
    })
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
