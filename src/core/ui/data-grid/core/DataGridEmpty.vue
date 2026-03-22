<script setup lang="ts">
defineProps<{
  message?: string
  colspan: number
}>()
</script>

<template>
  <tr>
    <td
      :colspan="colspan"
      class="h-40 text-center"
      style="color: var(--color-grid-text-muted); font-size: 13px;"
    >
      <div class="flex flex-col items-center justify-center gap-3">
        <!-- Empty grid icon -->
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.2"
          stroke-linecap="round"
          stroke-linejoin="round"
          style="opacity: 0.35;"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
        <span>{{ message ?? 'No records found' }}</span>
        <!-- Optional create action slot -->
        <slot name="action" />
      </div>
    </td>
  </tr>
</template>
