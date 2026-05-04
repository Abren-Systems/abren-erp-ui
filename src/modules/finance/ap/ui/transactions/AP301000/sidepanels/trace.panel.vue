<script setup lang="ts">
import { AppButton, AppSidePane } from '@/shared/components/primitives'
import { History } from 'lucide-vue-next'
import PaymentRequestTimeline from '../timeline.vue'
import type { PaymentRequest } from '../../../../domain/ap.types'

defineProps<{
  open: boolean
  request: PaymentRequest | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'view-detail', request: PaymentRequest): void
}>()
</script>

<template>
  <AppSidePane
    :open="open"
    :title="request ? `Trace: ${request.requestNumber}` : 'Trace'"
    mode="docked"
    width="320px"
    @update:open="emit('update:open', $event)"
  >
    <template #icon>
      <div class="h-6 w-6 rounded-md bg-primary-50 flex items-center justify-center">
        <History class="h-3.5 w-3.5 text-primary-600" />
      </div>
    </template>

    <div v-if="request" class="space-y-6">
      <PaymentRequestTimeline :request="request" density="compact" hide-header />
    </div>

    <template #footer>
      <AppButton
        v-if="request"
        variant="outline"
        size="sm"
        class="w-full h-8 text-[11px]"
        @click="emit('view-detail', request)"
      >
        View Full Detail
      </AppButton>
    </template>
  </AppSidePane>
</template>
