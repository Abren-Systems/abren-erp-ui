<script setup lang="ts">
interface Props {
  label: string
  value: string | number
  description?: string
  loading?: boolean
  trend?: {
    value: string
    positive?: boolean
  }
}

defineProps<Props>()
</script>

<template>
  <div
    class="rounded-2xl border border-[color:var(--color-neutral-200)] bg-white p-5 shadow-sm transition-all hover:shadow-md"
  >
    <div class="flex items-start justify-between">
      <div class="min-w-0 flex-1">
        <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-neutral-400)]">
          {{ label }}
        </p>
        <p
          class="mt-4 truncate text-2xl font-semibold tracking-tight text-[var(--color-neutral-900)]"
        >
          <template v-if="loading">...</template>
          <template v-else>{{ value }}</template>
        </p>
      </div>
      <div v-if="$slots['icon']" class="ml-4 shrink-0">
        <slot name="icon" />
      </div>
    </div>
    <p v-if="description" class="mt-2.5 text-xs leading-5 text-[var(--color-neutral-500)]">
      {{ description }}
    </p>
    <div v-if="trend" class="mt-3 flex items-center gap-1.5">
      <span
        :class="[
          'text-[10px] font-bold px-1.5 py-0.5 rounded-md',
          trend.positive
            ? 'text-[var(--color-success-700)] bg-[var(--color-success-50)]'
            : 'text-[var(--color-danger-700)] bg-[var(--color-danger-50)]',
        ]"
      >
        {{ trend.value }}
      </span>
      <span class="text-[10px] text-[var(--color-neutral-400)] font-medium">vs last period</span>
    </div>
  </div>
</template>
