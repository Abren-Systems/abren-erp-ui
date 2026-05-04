<script setup lang="ts">
import { computed, watch, h, ref } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { usePaymentRequest } from '../../../application/composables/usePaymentRequest'
import { useCreatePaymentRequest } from '../../../application/composables/useCreatePaymentRequest'
import { useApprovePaymentRequest } from '../../../application/composables/useApprovePaymentRequest'
import { useRejectPaymentRequest } from '../../../application/composables/useRejectPaymentRequest'
import { useAuthorizePaymentRequest } from '../../../application/composables/useAuthorizePaymentRequest'
import { useCancelPaymentRequest } from '../../../application/composables/useCancelPaymentRequest'
import { useSubmitPaymentRequest } from '../../../application/composables/useSubmitPaymentRequest'
import type { PaymentRequestId } from '@/shared/types/brand.types'
import {
  AppField,
  AppFormField,
  AppFieldset,
  FieldGroup,
  AppTabs,
} from '@/shared/components/field-system'
import { AppButton } from '@/shared/components/primitives'
import { History } from 'lucide-vue-next'
import PaymentRequestHeader from '../components/PaymentRequestHeader.vue'
import PaymentRequestActions, { type ScreenAction } from '../components/PaymentRequestActions.vue'
import PaymentRequestTraceDrawer from '../components/PaymentRequestTraceDrawer.vue'
import { useUsers } from '@/modules/core/application/composables/useUsers'
import { DataGrid, MoneyCell } from '@/shared/components/data-grid'
import { getPaymentRequestActions } from '../commands/payment-request.commands'
import { paymentRequestLineColumns } from '../grids/payment-request-lines.grid'
import { CURRENCY_OPTIONS } from '../fields/payment-request.fields'
import type { PaymentRequestLine } from '../../../domain/ap.types'

const props = defineProps<{ id: string }>()
const router = useRouter()

const isNew = computed(() => props.id === 'new')

// Fetch if existing record
const { request, isLoading, error } = usePaymentRequest(props.id as PaymentRequestId)
const { users } = useUsers()

// Action composables
const { approve, isPending: isApproving } = useApprovePaymentRequest(props.id as PaymentRequestId)
const { reject, isPending: isRejecting } = useRejectPaymentRequest(props.id as PaymentRequestId)
const { authorize, isPending: isAuthorizing } = useAuthorizePaymentRequest(
  props.id as PaymentRequestId,
)
const { cancel, isPending: isCancelling } = useCancelPaymentRequest(props.id as PaymentRequestId)
const { submit, isPending: isSubmittingRequest } = useSubmitPaymentRequest(
  props.id as PaymentRequestId,
)

// Creation composable (provides the local TanStack form)
const { form, isSubmitting: isCreating, isSaved, saveDraft } = useCreatePaymentRequest()

const activeTab = ref('Line Details')
const isTraceOpen = ref(false)

const isDraft = computed(() => isNew.value || request.value?.status === 'DRAFT')
const displayStatus = computed(() => (isNew.value ? 'DRAFT' : request.value?.status))
const displaySubmittedAt = computed(() => (isNew.value ? null : request.value?.submittedAt))

// Navigation Guard: Acumatica Pattern Unsaved Changes Warning
onBeforeRouteLeave((to, from, next) => {
  if (isNew.value && !isSaved.value && !isCreating.value) {
    const answer = window.confirm('You have unsaved work. Would you like to leave without saving?')
    if (answer) {
      next()
    } else {
      next(false)
    }
  } else {
    next()
  }
})

const isPending = computed(
  () =>
    isApproving.value ||
    isRejecting.value ||
    isAuthorizing.value ||
    isCancelling.value ||
    isSubmittingRequest.value ||
    isCreating.value,
)

const actions = computed<ScreenAction[]>(() => {
  if (isNew.value) return []
  if (!request.value) return []
  return getPaymentRequestActions(request.value.status)
})

function handleAction(key: string) {
  if (key === 'submit') void submit()
  if (key === 'approve') void approve()
  if (key === 'reject') void reject('Rejected via Focus Screen')
  if (key === 'authorize') void authorize()
  if (key === 'cancel') void cancel('Cancelled via Focus Screen')
}

// Ensure the form submits when clicking "Create Request"
function handleCreate() {
  form.handleSubmit()
}

const requesterEmail = computed(() => {
  if (isNew.value) return 'Current User' // Or pull from auth context
  const user = users.value?.find((u) => u.id === request.value?.requesterId)
  return user?.email ?? request.value?.requesterId
})

const beneficiaryEmail = computed(() => {
  const targetId = isNew.value ? form.state.values.beneficiaryId : request.value?.beneficiaryId
  if (!targetId) return ''
  const user = users.value?.find((u) => u.id === targetId)
  return user?.email ?? targetId
})

const lineColumns = paymentRequestLineColumns

// Fallback data for DataGrid if we are creating new
const currentLines = computed(() => {
  if (isNew.value) return form.state.values.lines || []
  return request.value?.lines || []
})

// Provide options for beneficiary select
const userOptions = computed(() => users.value?.map((u) => ({ label: u.email, value: u.id })) || [])
const currencyOptions = computed(() => CURRENCY_OPTIONS)
</script>

<template>
  <div class="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
    <div v-if="error" class="p-8">
      <AppFieldset title="Error Loading Request" variant="neutral" :columns="1">
        <AppField field="error" label="Error" :value="String(error)" type="text" />
      </AppFieldset>
    </div>
    <div v-else-if="isLoading && !request && !isNew" class="p-8">
      <AppFieldset title="Loading" variant="neutral" :columns="1">
        <AppField field="status" label="Status" value="Loading details..." type="text" />
      </AppFieldset>
    </div>
    <div v-else class="flex flex-col gap-6">
      <PaymentRequestHeader :request="isNew ? undefined : request">
        <template #actions>
          <template v-if="isNew">
            <AppButton variant="secondary" class="mr-2" @click="saveDraft"> Save Draft </AppButton>
            <AppButton variant="primary" :disabled="isCreating" @click="handleCreate">
              Create Request
            </AppButton>
          </template>
          <template v-else>
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
        </template>
      </PaymentRequestHeader>

      <form
        class="px-8 pb-8 flex flex-col gap-6"
        @submit.prevent="
          (e) => {
            ;(e as Event).stopPropagation()
            form.handleSubmit()
          }
        "
      >
        <!-- Top Section (Fieldsets) -->
        <AppFieldset variant="ghost" layout="horizontal" :columns="3">
          <FieldGroup>
            <AppField field="requester" label="Requester" :value="requesterEmail" type="id" />

            <AppFormField
              v-if="isNew"
              :field="form.Field('beneficiaryId')"
              label="Beneficiary"
              type="text"
              mode="edit"
            />
            <AppField
              v-else
              field="beneficiary"
              label="Beneficiary"
              :value="beneficiaryEmail"
              type="id"
            />

            <AppField
              field="status"
              label="Status"
              :value="displayStatus"
              type="status"
              :context="{ entity: 'PaymentRequest' }"
            />
          </FieldGroup>

          <FieldGroup>
            <AppField
              field="submittedAt"
              label="Submitted On"
              :value="displaySubmittedAt"
              type="date"
            />

            <AppFormField
              v-if="isNew"
              :field="form.Field('justification')"
              label="Justification"
              type="text"
              mode="edit"
            />
            <AppField
              v-else
              field="justification"
              label="Justification"
              :value="request?.justification"
              type="text"
            />
          </FieldGroup>

          <FieldGroup>
            <AppFormField
              v-if="isNew"
              :field="form.Field('currency')"
              label="Currency"
              type="text"
              mode="edit"
            />
            <AppField
              v-else
              field="currency"
              label="Currency"
              :value="request?.currency"
              type="text"
            />

            <!-- For simplicity in this proof, we will just use the standard AppField/AppFormField for totalAmount -->
            <AppField
              v-if="isNew"
              field="totalAmount"
              label="Order Total"
              :value="
                form.state.values.lines?.reduce(
                  (acc, curr) => acc + (Number(curr.amount) || 0),
                  0,
                ) || 0
              "
              type="money"
            />
            <AppField
              v-else
              field="totalAmount"
              label="Order Total"
              :value="request?.totalAmount"
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
          <!-- When creating, we would use an editable grid here. For now, read-only grid to prove the primary fields work. -->
          <DataGrid
            :columns="lineColumns"
            :data="currentLines"
            :loading="isLoading && !isNew"
            empty-message="No line items found"
          />
        </div>
      </form>
    </div>

    <!-- Trace Drawer (Lazy loaded context) -->
    <PaymentRequestTraceDrawer
      v-if="request && !isNew"
      v-model:open="isTraceOpen"
      :request="request"
    />
  </div>
</template>
