<script setup lang="ts">
/**
 * AppTabs — A lightweight tab bar primitive for separating fieldsets/summaries from grids/details.
 *
 * Emulates the Acumatica-style tab bar.
 */
import { ref } from 'vue'

const props = defineProps<{
  tabs: string[]
  modelValue?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const activeTab = ref(props.modelValue ?? props.tabs[0])

function selectTab(tab: string) {
  activeTab.value = tab
  emit('update:modelValue', tab)
}
</script>

<template>
  <div class="app-tabs">
    <div class="app-tabs__list">
      <button
        v-for="tab in tabs"
        :key="tab"
        class="app-tabs__tab"
        :class="{ 'app-tabs__tab--active': activeTab === tab }"
        @click="selectTab(tab)"
      >
        {{ tab }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.app-tabs {
  margin-bottom: var(--ds-spacing-md);
  border-bottom: 2px solid var(--color-primary-100);
}

.app-tabs__list {
  display: flex;
  gap: var(--ds-spacing-sm);
  margin-bottom: -2px; /* Pull tabs down over the border */
}

.app-tabs__tab {
  background: none;
  border: none;
  padding: var(--ds-spacing-sm) var(--ds-spacing-md);
  font-size: var(--text-body-sm);
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-neutral-500);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 150ms ease;
}

.app-tabs__tab:hover {
  color: var(--color-primary-600);
}

.app-tabs__tab--active {
  color: var(--color-primary-700);
  border-bottom: 2px solid var(--color-primary-500);
}
</style>
