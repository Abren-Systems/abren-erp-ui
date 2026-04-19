<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, X } from 'lucide-vue-next'
import { AppInput } from '@/shared/components/primitives'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  loading?: boolean
  selectedCount?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// Debounced search — avoids firing on every keystroke
let debounceTimer: ReturnType<typeof setTimeout>
const localValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (v) => {
    localValue.value = v
  },
)

function onInput(val: string) {
  localValue.value = val
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => emit('update:modelValue', val), 200)
}

function clear() {
  localValue.value = ''
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="toolbar">
    <!-- Global search using AppInput -->
    <div class="search-wrap">
      <AppInput
        :model-value="localValue"
        :placeholder="placeholder ?? 'Search…'"
        class="search-input"
        @update:model-value="onInput"
      >
        <template #start>
          <Search :size="14" class="search-icon" />
        </template>
        <template #end>
          <button v-if="localValue" class="clear-btn" @click="clear">
            <X :size="14" />
          </button>
        </template>
      </AppInput>
    </div>

    <!-- Selection count badge -->
    <span v-if="selectedCount && selectedCount > 0" class="selection-badge">
      {{ selectedCount }} selected
    </span>

    <!-- Action buttons from parent -->
    <div class="toolbar-actions">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 48px; /* Slightly taller for Dynamics 365 style */
  padding: 0 12px;
  background: #ffffff;
  border-bottom: 1px solid var(--color-neutral-200);
  flex-shrink: 0;
}

.search-wrap {
  width: 280px;
}

.search-icon {
  color: var(--color-neutral-600);
  margin-left: 4px;
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  color: var(--color-neutral-600);
  background: none;
  border: none;
  cursor: pointer;
}

.clear-btn:hover {
  color: var(--color-neutral-900);
  background: var(--color-neutral-100);
  border-radius: 2px;
}

.selection-badge {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary-700);
  background: var(--color-primary-50);
  padding: 2px 10px;
  border-radius: 2px;
  border: 1px solid var(--color-primary-100);
}

.toolbar-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
