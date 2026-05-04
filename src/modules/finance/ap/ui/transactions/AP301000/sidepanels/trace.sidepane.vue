<script setup lang="ts">
import { AppBadge, AppSidePane } from '@/shared/components/primitives'
import { AppFieldset, AppField } from '@/shared/components/field-system'
import { History } from 'lucide-vue-next'
import PaymentRequestTimeline from '../timeline.vue'
import type { PaymentRequest } from '../../../../domain/ap.types'

/**
 * Stage 3: TraceDrawer — Payment Request Provenance.
 *
 * Lazy-loaded contextual panel: workflow history, GL journal impact,
 * and linked source documents. Only shown when the user explicitly requests it.
 */

defineProps<{
  open: boolean
  request: PaymentRequest
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
}>()
</script>

<template>
  <AppSidePane
    :open="open"
    title="Trace: Payment Request"
    description="Workflow history and financial impact of this request."
    size="md"
    @update:open="emit('update:open', $event)"
  >
    <template #header-icon>
      <div class="p-2 bg-[var(--color-primary-50)] rounded-xl">
        <History class="h-5 w-5 text-[var(--color-primary-600)]" />
      </div>
    </template>

    <div class="space-y-8">
      <!-- Shared Timeline -->
      <PaymentRequestTimeline :request="request" />

      <!-- GL Journal Impact -->
      <AppFieldset
        v-if="request.targetLiabilityAccountId"
        title="Financial Impact (GL)"
        layout="vertical"
        :columns="1"
      >
        <AppField
          field="liability"
          label="Liability Account"
          :value="request.targetLiabilityAccountId"
          type="id"
        />
        <AppField
          field="disbursement"
          label="Disbursement Account"
          :value="request.bankAccountId"
          type="id"
        />
      </AppFieldset>

      <!-- Source Document -->
      <AppFieldset
        v-if="request.sourceModule"
        title="Source Document"
        layout="vertical"
        :columns="1"
      >
        <AppField
          field="module"
          label="Originating Module"
          :value="request.sourceModule"
          type="text"
        />
        <AppField
          field="reference"
          label="Internal Reference"
          :value="request.sourceId"
          type="id"
        />
      </AppFieldset>
    </div>
  </AppSidePane>
</template>
