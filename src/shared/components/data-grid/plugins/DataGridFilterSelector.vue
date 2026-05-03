<script setup lang="ts">
/**
 * DataGridFilterSelector.vue
 *
 * Compact dropdown for selecting filter presets (saved views).
 * Matches Acumatica's "All Records ∨" pattern.
 *
 * This is a Grid-owned plugin — it lives inside the DataGridToolbar.
 */
import { ref, computed } from 'vue'
import { ChevronDown, ListFilter } from 'lucide-vue-next'

export interface FilterPreset {
  id: string
  label: string
}

const props = defineProps<{
  modelValue: string
  options: FilterPreset[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', id: string): void
}>()

const isOpen = ref(false)

const activeLabel = computed(() => {
  const active = props.options.find((o) => o.id === props.modelValue)
  return active?.label ?? 'All Records'
})

function select(id: string) {
  emit('update:modelValue', id)
  isOpen.value = false
}

function toggle() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}
</script>

<template>
  <div class="filter-selector" @blur.capture="close">
    <button class="filter-trigger" :class="{ 'is-open': isOpen }" @click="toggle">
      <ListFilter :size="14" class="filter-icon" />
      <span class="filter-label">{{ activeLabel }}</span>
      <ChevronDown :size="12" class="chevron" :class="{ 'rotate-180': isOpen }" />
    </button>

    <Transition name="dropdown">
      <div v-if="isOpen" class="filter-dropdown">
        <button
          v-for="option in options"
          :key="option.id"
          class="filter-option"
          :class="{ 'is-active': modelValue === option.id }"
          @click="select(option.id)"
        >
          {{ option.label }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.filter-selector {
  position: relative;
}

.filter-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-neutral-700);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.filter-trigger:hover,
.filter-trigger.is-open {
  background: var(--color-neutral-100);
  border-color: var(--color-neutral-300);
}

.filter-icon {
  color: var(--color-neutral-400);
  flex-shrink: 0;
}

.filter-label {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chevron {
  color: var(--color-neutral-400);
  transition: transform 0.15s ease;
  flex-shrink: 0;
}

.filter-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 200px;
  background: #ffffff;
  border: 1px solid var(--color-neutral-200);
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 50;
  padding: 4px;
  overflow: hidden;
}

.filter-option {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-neutral-700);
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-align: left;
  transition: all 0.1s ease;
}

.filter-option:hover {
  background: var(--color-neutral-50);
}

.filter-option.is-active {
  background: var(--color-primary-50);
  color: var(--color-primary-700);
  font-weight: 600;
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
