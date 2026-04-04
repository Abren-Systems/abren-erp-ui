<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/shared/components/badge'

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
  if (props.isQuarantine) return 'destructive'
  if (props.isAvailable === false) return 'secondary'
  if (props.trackingMode === 'BATCH') return 'default'
  if (props.trackingMode === 'SERIAL') return 'outline'
  return 'default' // Need to ensure fallback matches expected types in our shadcn badge
})
</script>

<template>
  <Badge :variant="variant" class="font-semibold shadow-sm">
    <template v-if="props.isQuarantine">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-shield-alert inline-block mr-1 w-3 h-3"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </svg>
    </template>
    {{ statusText }}
  </Badge>
</template>
