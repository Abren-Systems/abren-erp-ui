<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePaymentRequest } from '../../../application/composables/usePaymentRequest'
import { useApprovePaymentRequest } from '../../../application/composables/useApprovePaymentRequest'
import { useRejectPaymentRequest } from '../../../application/composables/useRejectPaymentRequest'
import { useAuthorizePaymentRequest } from '../../../application/composables/useAuthorizePaymentRequest'
import { useCancelPaymentRequest } from '../../../application/composables/useCancelPaymentRequest'
import { useSubmitPaymentRequest } from '../../../application/composables/useSubmitPaymentRequest'
import type { PaymentRequestId } from '@/shared/types/brand.types'
import { AppField, AppFieldset, FieldGroup, AppTabs } from '@/shared/components/field-system'
import { AppButton } from '@/shared/components/primitives'
import { History } from 'lucide-vue-next'
import PaymentRequestHeader from '../components/PaymentRequestHeader.vue'
import PaymentRequestActions, { type ScreenAction } from '../components/PaymentRequestActions.vue'
import PaymentRequestTraceDrawer from '../components/PaymentRequestTraceDrawer.vue'
import { useUsers } from '@/modules/core/application/composables/useUsers'
import { DataGrid, MoneyCell } from '@/shared/components/data-grid'
import type { PaymentRequestLine } from '../../../domain/ap.types'
import { h, ref } from 'vue'
import type { Row } from '@tanstack/vue-table'

const props = defineProps<{ id: string }>()
const router = useRouter()

const { request, isLoading, error } = usePaymentRequest(props.id as PaymentRequestId)
const { users } = useUsers()

const { approve, isPending: isApproving } = useApprovePaymentRequest(props.id as PaymentRequestId)
const { reject, isPending: isRejecting } = useRejectPaymentRequest(props.id as PaymentRequestId)
const { authorize, isPending: isAuthorizing } = useAuthorizePaymentRequest(
  props.id as PaymentRequestId,
)
const { cancel, isPending: isCancelling } = useCancelPaymentRequest(props.id as PaymentRequestId)
const { submit, isPending: isSubmitting } = useSubmitPaymentRequest(props.id as PaymentRequestId)

const activeTab = ref('Line Details')
const isTraceOpen = ref(false)

/** Screen-level editability: DRAFT records allow inline editing */
const isDraft = computed(() => request.value?.status === 'DRAFT')
const draftJustification = ref('')

const isPending = computed(
  () =>
    isApproving.value ||
    isRejecting.value ||
    isAuthorizing.value ||
    isCancelling.value ||
    isSubmitting.value,
)

const actions = computed<ScreenAction[]>(() => {
  if (!request.value) return []
  const status = request.value.status
  const list: ScreenAction[] = []

  if (status === 'DRAFT' || status === 'REJECTED') {
    list.push({
      key: 'submit',
      label: 'Submit',
      variant: 'primary',
      enabled: true,
      requiresConfirmation: true,
      description: 'Submit this request for approval?',
    })
  }
  if (status === 'SUBMITTED') {
    list.push({
      key: 'approve',
      label: 'Approve',
      variant: 'primary',
      enabled: true,
      requiresConfirmation: true,
      description: 'Approve this payment request?',
    })
    list.push({
      key: 'reject',
      label: 'Reject',
      variant: 'danger',
      enabled: true,
      requiresConfirmation: true,
      description: 'Reject this payment request?',
    })
  }
  if (status === 'APPROVED') {
    list.push({
      key: 'authorize',
      label: 'Authorize',
      variant: 'primary',
      enabled: true,
      requiresConfirmation: true,
      description: 'Authorize this payment?',
    })
  }
  if (status === 'DRAFT' || status === 'SUBMITTED') {
    list.push({
      key: 'cancel',
      label: 'Cancel',
      variant: 'danger',
      enabled: true,
      requiresConfirmation: true,
      description: 'Cancel this request permanently?',
    })
  }
  return list
})

function handleAction(key: string) {
  if (key === 'submit') void submit()
  if (key === 'approve') void approve()
  if (key === 'reject') void reject('Rejected via Focus Screen')
  if (key === 'authorize') void authorize()
  if (key === 'cancel') void cancel('Cancelled via Focus Screen')
}

const requesterEmail = computed(() => {
  const user = users.value?.find((u) => u.id === request.value?.requesterId)
  return user?.email ?? request.value?.requesterId
})

const beneficiaryEmail = computed(() => {
  const user = users.value?.find((u) => u.id === request.value?.beneficiaryId)
  return user?.email ?? request.value?.beneficiaryId
})

function goBack() {
  void router.push({ name: 'PaymentRequestsList' })
}

const lineColumns = [
  {
    id: 'index',
    header: 'LINE #',
    cell: ({ row }: { row: Row<PaymentRequestLine> }) =>
      h('span', { class: 'font-mono text-xs text-neutral-500' }, row.index + 1),
    size: 80,
  },
  {
    id: 'description',
    header: 'DESCRIPTION',
    accessorKey: 'description',
  },
  {
    id: 'amount',
    header: 'AMOUNT',
    cell: ({ row }: { row: Row<PaymentRequestLine> }) =>
      h(MoneyCell, { amount: row.original.amount, align: 'right' }),
    size: 150,
  },
]
</script>

<template>
  <div class="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
    <div v-if="error" class="p-8">
      <AppFieldset title="Error Loading Request" variant="neutral" :columns="1">
        <AppField field="error" label="Error" :value="String(error)" type="text" />
      </AppFieldset>
    </div>
    <div v-else-if="isLoading && !request" class="p-8">
      <AppFieldset title="Loading" variant="neutral" :columns="1">
        <AppField field="status" label="Status" value="Loading details..." type="text" />
      </AppFieldset>
    </div>
    <div v-else-if="request" class="flex flex-col gap-6">
      <PaymentRequestHeader :request="request">
        <template #actions>
          <AppButton variant="secondary" @click="isTraceOpen = true">
            <History class="mr-2 h-4 w-4" />
            Trace
          </AppButton>
          <PaymentRequestActions
            :actions="actions"
            :is-pending="isPending"
            @action="handleAction"
          />
        </template>
      </PaymentRequestHeader>

      <div class="px-8 pb-8 flex flex-col gap-6">
        <!-- Top Section (Fieldsets) -->
        <AppFieldset variant="ghost" layout="horizontal" :columns="3">
          <FieldGroup>
            <AppField field="requester" label="Requester" :value="requesterEmail" type="id" />
            <AppField field="beneficiary" label="Beneficiary" :value="beneficiaryEmail" type="id" />
            <AppField
              field="status"
              label="Status"
              :value="request.status"
              type="status"
              :context="{ entity: 'PaymentRequest' }"
            />
          </FieldGroup>

          <FieldGroup>
            <AppField
              field="submittedAt"
              label="Submitted On"
              :value="request.submittedAt"
              type="date"
            />
            <AppField
              field="justification"
              label="Justification"
              :value="request.justification"
              type="text"
              :mode="isDraft ? 'edit' : 'read'"
              v-model="draftJustification"
            />
          </FieldGroup>

          <FieldGroup>
            <AppField field="currency" label="Currency" :value="request.currency" type="text" />
            <AppField
              field="totalAmount"
              label="Order Total"
              :value="request.totalAmount"
              type="money"
            />
          </FieldGroup>
        </AppFieldset>

        <!-- Middle Section (Tab Bar) -->
        <AppTabs :tabs="['Line Details']" v-model="activeTab" />

        <!-- Bottom Section (Grid/Content) -->
        <div
          v-if="activeTab === 'Line Details'"
          class="rounded-lg border border-[var(--color-neutral-200)] overflow-hidden bg-white shadow-sm"
        >
          <DataGrid
            :columns="lineColumns"
            :data="request.lines || []"
            :loading="isLoading"
            empty-message="No line items found"
          />
        </div>
      </div>
    </div>

    <!-- Trace Drawer (Lazy loaded context) -->
    <PaymentRequestTraceDrawer v-if="request" v-model:open="isTraceOpen" :request="request" />
  </div>
</template>
