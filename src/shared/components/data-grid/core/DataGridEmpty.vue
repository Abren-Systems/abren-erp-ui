<script setup lang="ts">
import { FileSearch } from 'lucide-vue-next'

defineProps<{
  message?: string
  colspan: number
}>()
</script>

<template>
  <tr class="hover:bg-transparent">
    <td :colspan="colspan" class="h-64 py-12">
      <div class="flex flex-col items-center justify-center gap-4 max-w-xs mx-auto text-center">
        <FileSearch :size="32" stroke-width="1.5" class="text-neutral-300" />
        <div class="space-y-1">
          <h3 class="text-xs font-bold text-neutral-900 uppercase tracking-tight">
            {{ message ?? 'No Records Found' }}
          </h3>
          <p
            class="text-[10px] leading-relaxed text-neutral-400 font-bold uppercase tracking-tight"
          >
            Adjust filters or search criteria to refine results.
          </p>
        </div>
        <slot name="action" />
      </div>
    </td>
  </tr>
</template>
