<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, X } from 'lucide-vue-next'

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

watch(() => props.modelValue, (v) => { localValue.value = v })

function onInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
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
    <!-- Global search -->
    <div class="search-wrap">
      <Search :size="13" class="search-icon" />
      <input
        :value="localValue"
        :placeholder="placeholder ?? 'Search…'"
        class="search-input"
        type="text"
        @input="onInput"
      />
      <button v-if="localValue" class="clear-btn" @click="clear">
        <X :size="12" />
      </button>
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
  gap: 8px;
  height: 40px;
  padding: 0 8px;
  background: var(--color-grid-header-bg);
  border-bottom: 1px solid var(--color-grid-header-border);
  flex-shrink: 0;
}

.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 8px;
  color: var(--color-grid-text-muted);
  pointer-events: none;
}

.search-input {
  height: 26px;
  width: 220px;
  padding: 0 28px 0 28px;
  font-size: 12.5px;
  border-radius: 4px;
  border: 1px solid var(--color-grid-col-divider);
  background: var(--color-grid-bg);
  color: var(--color-grid-text);
  outline: none;
  transition: border-color 0.12s;
}

.search-input::placeholder {
  color: var(--color-grid-text-muted);
}

.search-input:focus {
  border-color: var(--color-primary-500);
}

.clear-btn {
  position: absolute;
  right: 6px;
  display: flex;
  align-items: center;
  color: var(--color-grid-text-muted);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color 0.12s;
}
.clear-btn:hover { color: var(--color-grid-text); }

.selection-badge {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-primary-400);
  background: color-mix(in srgb, var(--color-primary-500) 15%, transparent);
  padding: 2px 8px;
  border-radius: 10px;
}

.toolbar-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
