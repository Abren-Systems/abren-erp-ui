<script setup lang="ts">
/**
 * DataGridToolbar.vue
 *
 * The Grid's own unified control bar.
 * Layout: [Filter Selector / Quick Filters] ←→ [Filter Settings + Search]
 *
 * This matches Acumatica's Row 2: a single horizontal bar
 * with filter controls on the left and search on the right.
 */
import { ref, watch } from 'vue'
import { Search, X, List, LayoutGrid, LayoutList } from 'lucide-vue-next'
import { AppInput, AppButton } from '@/shared/components/primitives'

const props = defineProps<{
  modelValue: string
  density?: 'compact' | 'standard' | 'relaxed'
  placeholder?: string
  loading?: boolean
  selectedCount?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:density', value: 'compact' | 'standard' | 'relaxed'): void
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
    <!-- Left: Search + Filter Selector -->
    <div class="toolbar-left">
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

      <slot />
    </div>

    <!-- Right: Filter controls + Grid Settings -->
    <div class="toolbar-right">
      <slot name="controls" />

      <!-- Density Gutter (Relocated from Center) -->
      <div
        class="flex items-center bg-[var(--color-neutral-50)] p-0.5 rounded border border-[var(--color-neutral-200)] ml-1"
      >
        <button
          v-for="d in [
            { id: 'compact', icon: List },
            { id: 'standard', icon: LayoutGrid },
            { id: 'relaxed', icon: LayoutList },
          ] as const"
          :key="d.id"
          class="px-1.5 py-1 flex items-center justify-center rounded-sm transition-colors"
          :class="
            props.density === d.id
              ? 'bg-white text-black'
              : 'text-[var(--color-neutral-400)] hover:text-black'
          "
          @click="emit('update:density', d.id as any)"
          :title="`${d.id.charAt(0).toUpperCase() + d.id.slice(1)} Density`"
        >
          <component :is="d.icon" :size="14" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: var(--layout-gutter);
  height: var(--grid-toolbar-h);
  padding: 0 var(--layout-gutter);
  background: var(--app-surface);
  border-bottom: 1px solid var(--color-neutral-200);
  flex-shrink: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-wrap {
  width: 240px;
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
</style>
