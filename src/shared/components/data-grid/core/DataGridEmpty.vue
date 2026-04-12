<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'

defineProps<{
  message?: string
  colspan: number
}>()
</script>

<template>
  <tr class="hover:bg-transparent">
    <td :colspan="colspan" class="h-64 py-12">
      <div class="flex flex-col items-center justify-center gap-3 text-neutral-400">
        <Inbox :size="48" stroke-width="1.2" class="opacity-40" />
        <span class="text-sm font-medium">{{ message ?? 'No records found' }}</span>
        <slot name="action" />
      </div>
    </td>
  </tr>
</template>
