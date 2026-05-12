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
import { ref, watch, computed } from 'vue'
import { Search, X, List, LayoutGrid, LayoutList, ChevronDown } from 'lucide-vue-next'
import { onClickOutside } from '@vueuse/core'
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

// ── Density Dropdown ──
const isDensityOpen = ref(false)
const densityRef = ref<HTMLElement | null>(null)
onClickOutside(densityRef, () => (isDensityOpen.value = false))

const DENSITY_OPTIONS = [
  { id: 'compact', icon: List, label: 'Compact' },
  { id: 'standard', icon: LayoutGrid, label: 'Standard' },
  { id: 'relaxed', icon: LayoutList, label: 'Relaxed' },
] as const

const currentDensityOption = computed(() => {
  return DENSITY_OPTIONS.find((o) => o.id === props.density) || DENSITY_OPTIONS[1]
})

function selectDensity(id: 'compact' | 'standard' | 'relaxed') {
  emit('update:density', id)
  isDensityOpen.value = false
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

      <!-- Density Dropdown -->
      <div class="density-selector" ref="densityRef">
        <AppButton
          variant="stealth"
          size="sm"
          class="density-trigger"
          :title="`Current Density: ${currentDensityOption.label}`"
          @click="isDensityOpen = !isDensityOpen"
        >
          <component :is="currentDensityOption.icon" :size="14" />
          <ChevronDown :size="10" class="ml-1 opacity-50" />
        </AppButton>

        <Transition name="density-fade">
          <div v-if="isDensityOpen" class="density-panel">
            <button
              v-for="opt in DENSITY_OPTIONS"
              :key="opt.id"
              class="density-item"
              :class="{ 'density-item--active': props.density === opt.id }"
              @click="selectDensity(opt.id)"
            >
              <component :is="opt.icon" :size="14" class="mr-2" />
              <span>{{ opt.label }}</span>
            </button>
          </div>
        </Transition>
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

/* Density Dropdown Styles */
.density-selector {
  position: relative;
  margin-left: 0.25rem;
}

.density-trigger {
  padding: 0 0.375rem;
  height: 1.75rem;
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
}

.density-panel {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 8rem;
  background: white;
  border: 1px solid var(--color-neutral-200);
  border-radius: 0.375rem;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
  z-index: 50;
  padding: 0.25rem 0;
}

.density-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: none;
  background: transparent;
  font-size: 0.75rem;
  color: var(--color-neutral-700);
  cursor: pointer;
  transition: background 0.1s ease;
}

.density-item:hover {
  background: var(--color-neutral-50);
}

.density-item--active {
  background: var(--color-primary-50);
  color: var(--color-primary-700);
  font-weight: 500;
}

/* Transition */
.density-fade-enter-active,
.density-fade-leave-active {
  transition:
    opacity 0.1s ease,
    transform 0.1s ease;
}

.density-fade-enter-from,
.density-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
