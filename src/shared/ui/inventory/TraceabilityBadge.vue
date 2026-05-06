<script setup lang="ts">
import { computed } from 'vue'
import { AppBadge } from '@/shared/components/primitives'
import { ShieldAlert, CheckCircle, PackageSearch } from 'lucide-vue-next'

const props = defineProps<{
  isQuarantine?: boolean
  isAvailable?: boolean
  trackingMode?: 'NONE' | 'BATCH' | 'SERIAL'
}>()

const statusText = computed(() => {
  if (props.isQuarantine) return 'Quarantined'
  if (props.isAvailable === false) return 'Reserved / Expired'
  if (props.trackingMode) return `Tracked: ${props.trackingMode}`
  return 'Available'
})

const variant = computed(() => {
  if (props.isQuarantine) return 'danger'
  if (props.isAvailable === false) return 'neutral'
  if (props.trackingMode === 'BATCH') return 'info'
  if (props.trackingMode === 'SERIAL') return 'primary'
  return 'success'
})
</script>

<template>
  <AppBadge :variant="variant">
    <template v-if="props.isQuarantine">
      <ShieldAlert :size="10" class="mr-1" />
    </template>
    <template v-else-if="props.isAvailable === false">
      <PackageSearch :size="10" class="mr-1" />
    </template>
    <template v-else>
      <CheckCircle :size="10" class="mr-1" />
    </template>
    {{ statusText }}
  </AppBadge>
</template>
