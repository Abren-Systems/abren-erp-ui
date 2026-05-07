import { computed, type ComputedRef } from 'vue'
import type { FieldDefinition } from '../field-definition.types'
import type { ScreenController } from '@/platform/screen-runtime/screen-controller.types'
import type { ScreenStateMachine } from '@/platform/screen-runtime/state-machine.types'
import { debugBus } from '@/platform/debug/debug-bus'
import type { FieldType } from '@/shared/components/field-system/registry'

export interface FieldBinding<TValue = unknown> {
  field: string
  value: ComputedRef<TValue | undefined>
  modelValue: ComputedRef<TValue | undefined>
  label: string
  readonly: ComputedRef<boolean>
  required: ComputedRef<boolean>
  'onUpdate:modelValue': (newValue: TValue) => void
  error: ComputedRef<string | null>
  type: FieldType
}

/**
 * useField Binding API
 *
 * Binds a formal FieldDefinition to the active ScreenController.
 * This guarantees that the View cannot mutate data independently,
 * and that all readonly/required rules are evaluated centrally by the State Machine.
 */
export function useField<TEntity, TValue>(
  controller: ScreenController<TEntity, string>,
  definition: FieldDefinition<TEntity, TValue>,
): FieldBinding<TValue> {
  const value = controller.data.select(definition.key) as ComputedRef<TValue | undefined>

  const isReadonly = computed(() => {
    // Priority 1: Unified model field overrides (single source of truth)
    const fieldOverride = controller.model.value.ui.fields.overrides[String(definition.key)]
    if (fieldOverride?.readonly !== undefined) {
      return fieldOverride.readonly
    }
    // Priority 2: Field-level custom readonly function (legacy fallback)
    if (definition.readonly) {
      return definition.readonly(
        controller.state as ScreenStateMachine,
        controller.entity.value as Partial<TEntity>,
      )
    }
    // Priority 3: Global editability from domain capabilities
    return !controller.model.value.domain.capabilities.canEdit
  })

  const isRequired = computed(() => {
    // Priority 1: Unified model field overrides
    const fieldOverride = controller.model.value.ui.fields.overrides[String(definition.key)]
    if (fieldOverride?.required !== undefined) {
      return fieldOverride.required
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

    // Route 1: Controller implements setFieldValue directly (explicit mutation adapter)
    if ('setFieldValue' in controller) {
      const mutator = controller as unknown as {
        setFieldValue: (k: keyof TEntity, v: TValue) => void
      }
      mutator.setFieldValue(fieldKey, newValue)
    }
    // Route 2: TanStack Form attached to the controller (new record or edit mode)
    else if ('form' in controller) {
      const formControl = (
        controller as unknown as { form: { setFieldValue: (k: keyof TEntity, v: TValue) => void } }
      ).form
      formControl.setFieldValue(fieldKey, newValue)
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
    field: String(definition.key),
    value,
    modelValue: value,
    label: definition.label,
    readonly: isReadonly,
    required: isRequired,
    'onUpdate:modelValue': onChange,
    error,
    type: definition.type as FieldType,
  }
}
