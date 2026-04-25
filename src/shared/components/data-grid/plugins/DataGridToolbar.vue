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
  <div class="toolbar" :class="{ 'toolbar--selection-mode': selectedCount && selectedCount > 0 }">
    <!-- Selection mode indicator and message -->
    <div
      v-if="selectedCount && selectedCount > 0"
      class="selection-info animate-in fade-in slide-in-from-left-2 duration-200"
    >
      <span class="selection-badge">
        {{ selectedCount }}
      </span>
      <span class="selection-text">Records selected for bulk action</span>
    </div>

    <!-- Global search (hidden in selection mode to focus on actions) -->
    <div v-else class="search-wrap">
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
  height: 40px;
  padding: 0 12px;
  background: #ffffff;
  border-bottom: 1px solid var(--color-neutral-200);
  flex-shrink: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Command Mode Aesthetic */
.toolbar--selection-mode {
  background: var(--color-primary-900);
  border-bottom-color: var(--color-primary-800);
  color: #ffffff;
}

.search-wrap {
  width: 320px;
}

.search-icon {
  color: var(--color-neutral-400);
  margin-left: 4px;
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  color: var(--color-neutral-400);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.1s ease;
}

.clear-btn:hover {
  color: var(--color-danger-600);
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selection-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #ffffff;
  color: var(--color-primary-900);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 800;
}

.selection-text {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: -0.01em;
  opacity: 0.9;
}

.toolbar-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Deep override for buttons in selection mode */
.toolbar--selection-mode :deep(.app-button) {
  border-color: rgba(255, 255, 255, 0.2);
}

.toolbar--selection-mode :deep(.app-button--primary) {
  background: #ffffff;
  color: var(--color-primary-900);
}

.toolbar--selection-mode :deep(.app-button--stealth) {
  color: rgba(255, 255, 255, 0.9);
}

.toolbar--selection-mode :deep(.app-button--stealth:hover) {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}
</style>
