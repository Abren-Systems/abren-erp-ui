<script setup lang="ts">
import { computed } from 'vue'
import { Info, AlertTriangle, XCircle } from 'lucide-vue-next'
import type { BannerPolicy } from '../screen-runtime/screen-state-policy.types'

const props = defineProps<{
  banner: BannerPolicy
}>()

const icon = computed(() => {
  switch (props.banner.variant) {
    case 'info':
      return Info
    case 'warning':
      return AlertTriangle
    case 'danger':
      return XCircle
    default:
      return Info
  }
})

const variantClasses = computed(() => {
  switch (props.banner.variant) {
    case 'info':
      return 'bg-blue-50 text-blue-800 border-blue-200'
    case 'warning':
      return 'bg-amber-50 text-amber-800 border-amber-200'
    case 'danger':
      return 'bg-red-50 text-red-800 border-red-200'
    default:
      return 'bg-gray-50 text-gray-800 border-gray-200'
  }
})

const iconClasses = computed(() => {
  switch (props.banner.variant) {
    case 'info':
      return 'text-blue-500'
    case 'warning':
      return 'text-amber-500'
    case 'danger':
      return 'text-red-500'
    default:
      return 'text-gray-500'
  }
})
</script>

<template>
  <div
    class="flex items-start gap-3 px-4 py-3 mx-4 mt-4 border rounded-md text-sm font-medium"
    :class="variantClasses"
  >
    <component :is="icon" class="w-5 h-5 flex-shrink-0 mt-0.5" :class="iconClasses" />
    <div class="flex-1 leading-relaxed">
      {{ banner.messageKey }}
    </div>
  </div>
</template>
