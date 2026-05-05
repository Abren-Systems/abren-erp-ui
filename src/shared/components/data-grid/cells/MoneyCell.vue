<script setup lang="ts">
import { h } from 'vue'
import { Money } from '@/shared/domain/money'
import { cn } from '@/shared/utils'

interface MoneyCellProps {
  amount: Money
  class?: string
}

defineProps<MoneyCellProps>()
</script>

<template>
  <span :class="cn('font-bold tabular-nums', $props.class)">
    {{ amount.format() }}
  </span>
</template>
