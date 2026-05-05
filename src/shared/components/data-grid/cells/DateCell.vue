<script setup lang="ts">
import { BusinessDate, type IsoDate } from '@/shared/domain/business-date'
import { cn } from '@/shared/utils'

interface DateCellProps {
  date: IsoDate | null | undefined
  format?: string
  class?: string
}

const props = defineProps<DateCellProps>()
</script>

<template>
  <span :class="cn('text-sm text-neutral-600', props.class)">
    {{ date ? BusinessDate.format(date) : '—' }}
  </span>
</template>
