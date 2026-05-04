<script setup lang="ts">
import { PageHeader } from '@/shared/components/workspace'
import { ArrowLeft } from 'lucide-vue-next'
import { AppButton } from '@/shared/components/primitives'
import { useRouter } from 'vue-router'
import type { PaymentRequest } from '../../../domain/ap.types'

const props = defineProps<{
  request?: PaymentRequest
}>()

const router = useRouter()

function goBack() {
  void router.push({ name: 'PaymentRequestsList' })
}
</script>

<template>
  <PageHeader
    :title="
      request
        ? `${request.requestNumber} | ${request.beneficiaryId.slice(0, 8)}`
        : 'New Payment Request'
    "
    description="Payment Authorization Workflow"
  >
    <template #start>
      <AppButton variant="stealth" size="sm" class="h-8 w-8 p-0" @click="goBack">
        <ArrowLeft :size="16" />
      </AppButton>
    </template>
    <template #actions>
      <slot name="actions" />
    </template>
  </PageHeader>
</template>
