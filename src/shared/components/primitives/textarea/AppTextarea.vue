<script setup lang="ts">
/**
 * AppTextarea.vue
 *
 * A high-density wrapper for fluent-text-area.
 * Bridges Vue's v-model to native Web Component properties.
 */

interface Props {
  modelValue?: string | number
  label?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  error?: string
  rows?: number
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  placeholder: '',
  disabled: false,
  readonly: false,
  required: false,
  error: '',
  rows: 3,
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="app-textarea-container">
    <label v-if="label" class="app-textarea-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>

    <fluent-text-area
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :rows="rows"
      class="app-textarea-field"
      @input="handleInput"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
    />

    <p v-if="description" class="app-textarea-description">
      {{ description }}
    </p>

    <span v-if="error" class="app-textarea-error">
      {{ error }}
    </span>
  </div>
</template>

<style scoped>
.app-textarea-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.app-textarea-label {
  font-size: 10px;
  font-bold: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-neutral-500);
}

.required-mark {
  color: var(--color-danger-600);
  margin-left: 2px;
}

.app-textarea-field {
  width: 100%;
  --control-corner-radius: 2px;
  min-height: 64px;
}

.app-textarea-field :deep(::part(control)) {
  font-size: 13px;
  line-height: 1.5;
  padding: 8px;
  background-color: var(--color-neutral-50);
}

.app-textarea-field :deep(::part(control):focus) {
  background-color: white;
}

.app-textarea-description {
  font-size: 10px;
  color: var(--color-neutral-400);
  margin-top: 2px;
}

.app-textarea-error {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-danger-600);
  margin-top: 2px;
}
</style>
