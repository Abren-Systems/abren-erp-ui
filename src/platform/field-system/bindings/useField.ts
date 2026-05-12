import { computed, type ComputedRef } from 'vue'
import type { FieldDefinition } from '../field-definition.types'
import type { ScreenController } from '@/platform/screen-runtime/screen-controller.types'
import type { ScreenStateMachine } from '@/platform/screen-runtime/state-machine.types'
import { transitionRecorder } from '@/platform/debug/transition-recorder'
import type { FieldType } from '@/shared/components/field-system/registry'

export interface FieldBinding<TValue = unknown> {
  field: string
  value: ComputedRef<TValue | undefined>
  modelValue: ComputedRef<TValue | undefined>
  label: string
  readonly: ComputedRef<boolean>
  required: ComputedRef<boolean>
  hidden: ComputedRef<boolean>
  'onUpdate:modelValue': (newValue: TValue) => void
  error: ComputedRef<string | null>
  type: FieldType
  mode: ComputedRef<'edit' | 'read'>
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
    // Priority 0: Operational Projection (Backend-Derived Authority)
    const operationalPermission =
      controller.model.value.domain.backend.operations?.permissions[String(definition.key)]
    if (operationalPermission === 'readonly') return true
    if (operationalPermission === 'hidden') return true // Hidden implies readonly

    // Priority 1: Unified model field overrides (Frontend Personalization/Logic)
    const fieldOverride = controller.model.value.ui.fields.overrides[String(definition.key)]
    if (fieldOverride?.readonly !== undefined) {
      return fieldOverride.readonly
    }
    // Priority 2: Field-level custom readonly function (Legacy fallback)
    if (definition.readonly) {
      return definition.readonly(
        controller.state as ScreenStateMachine,
        controller.entity.value as Partial<TEntity>,
      )
    }
    // Priority 3: Global editability from domain capabilities
    return !controller.model.value.domain.capabilities.canEdit
  })

  const isHidden = computed(() => {
    // Priority 0: Operational Projection
    const operationalPermission =
      controller.model.value.domain.backend.operations?.permissions[String(definition.key)]
    if (operationalPermission === 'hidden') return true

    // Priority 1: Unified model field overrides
    const fieldOverride = controller.model.value.ui.fields.overrides[String(definition.key)]
    if (fieldOverride?.hidden !== undefined) {
      return fieldOverride.hidden
    }
    return false
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
    if (isReadonly.value) return // Block mutation if State Machine or Backend forbids it

    const fieldKey = definition.key

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
    transitionRecorder.recordTransition(
      { type: 'mutation', source: `AppField(${String(fieldKey)})` },
      { operations: [{ op: 'replace', path: String(fieldKey), value: newValue }] },
      [],
      controller.model.value.domain.backend.operations?.version ?? 0,
    )
  }

  return {
    field: String(definition.key),
    value,
    modelValue: value,
    label: definition.label,
    readonly: isReadonly,
    required: isRequired,
    hidden: isHidden,
    'onUpdate:modelValue': onChange,
    error,
    type: definition.type as FieldType,
    mode: computed(() => (isReadonly.value ? 'read' : 'edit')),
  }
}
