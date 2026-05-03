<script setup lang="ts">
/**
 * WorkspaceTabs.vue
 *
 * Actionable buckets for dense Workspaces.
 * Replaces traditional dropdown filters with semantic, workflow-driven tabs.
 */

export interface WorkspaceTab {
  id: string
  label: string
  subLabel?: string | number
  count?: number
}

defineProps<{
  tabs: WorkspaceTab[]
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', id: string): void
}>()
</script>

<template>
  <div class="flex items-center">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="group flex flex-col items-start px-4 py-2 border-r border-neutral-100 last:border-0 transition-all focus:outline-none"
      @click="emit('update:modelValue', tab.id)"
    >
      <span
        class="text-[10px] font-bold tracking-wider uppercase transition-colors"
        :class="
          modelValue === tab.id
            ? 'text-[var(--color-primary-600)]'
            : 'text-[var(--color-neutral-400)] group-hover:text-[var(--color-neutral-600)]'
        "
      >
        {{ tab.label }}
      </span>
      <span
        class="text-xs font-semibold mt-0.5"
        :class="
          modelValue === tab.id
            ? 'text-[var(--color-neutral-900)]'
            : 'text-[var(--color-neutral-500)]'
        "
      >
        {{ tab.subLabel ?? tab.count }}
      </span>
      <div
        class="h-0.5 w-full mt-2 rounded-full transition-all"
        :class="modelValue === tab.id ? 'bg-[var(--color-primary-600)]' : 'bg-transparent'"
      />
    </button>
  </div>
</template>
