<script setup lang="ts">
import { h } from 'vue'
import {
  AppField,
  AppFormField,
  AppFieldset,
  FieldGroup,
  AppTabs,
} from '@/shared/components/field-system'
import { AppButton } from '@/shared/components/primitives'
import { History } from 'lucide-vue-next'
import PaymentRequestHeader from './header.vue'
import PaymentRequestActions from './actions.vue'
import PaymentRequestTraceDrawer from './sidepanels/trace.sidepane.vue'
import { DataGrid } from '@/shared/components/data-grid'
import { paymentRequestLineColumns } from './grids/lines.grid'
import { usePaymentRequestEntry } from './controller'

const props = defineProps<{ id: string }>()

const ctrl = usePaymentRequestEntry(props.id)
</script>

<template>
  <div class="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
    <div v-if="ctrl.error.value" class="p-8">
      <AppFieldset title="Error Loading Request" variant="neutral" :columns="1">
        <AppField field="error" label="Error" :value="String(ctrl.error.value)" type="text" />
      </AppFieldset>
    </div>
    <div v-else-if="ctrl.isLoading.value && !ctrl.entity.value && !ctrl.isNew.value" class="p-8">
      <AppFieldset title="Loading" variant="neutral" :columns="1">
        <AppField field="status" label="Status" value="Loading details..." type="text" />
      </AppFieldset>
    </div>
    <div v-else class="flex flex-col gap-6">
      <PaymentRequestHeader :request="ctrl.isNew.value ? undefined : ctrl.entity.value">
        <template #actions>
          <template v-if="ctrl.isNew.value">
            <AppButton variant="secondary" class="mr-2" @click="ctrl.saveDraft">
              Save Draft
            </AppButton>
            <AppButton
              variant="primary"
              :disabled="ctrl.isCreating.value"
              @click="ctrl.handleCreate"
            >
              Create Request
            </AppButton>
          </template>
          <template v-else>
            <AppButton variant="secondary" @click="ctrl.isTraceOpen.value = true">
              <History class="mr-2 h-4 w-4" />
              Trace
            </AppButton>
            <PaymentRequestActions
              :actions="ctrl.actions.value"
              :is-pending="ctrl.isPending.value"
              @action="ctrl.handleAction"
            />
          </template>
        </template>
      </PaymentRequestHeader>

      <form
        class="px-8 pb-8 flex flex-col gap-6"
        @submit.prevent="
          (e) => {
            ;(e as Event).stopPropagation()
            ctrl.form.handleSubmit()
          }
        "
      >
        <!-- Top Section (Fieldsets) -->
        <AppFieldset variant="ghost" layout="horizontal" :columns="3">
          <FieldGroup>
            <AppField
              field="requester"
              label="Requester"
              :value="ctrl.requesterEmail.value"
              type="id"
            />

            <AppFormField
              v-if="ctrl.isNew.value"
              :field="ctrl.form.Field('beneficiaryId')"
              label="Beneficiary"
              type="text"
              mode="edit"
            />
            <AppField
              v-else
              field="beneficiary"
              label="Beneficiary"
              :value="ctrl.beneficiaryEmail.value"
              type="id"
            />

            <AppField
              field="status"
              label="Status"
              :value="ctrl.displayStatus.value"
              type="status"
              :context="{ entity: 'PaymentRequest' }"
            />
          </FieldGroup>

          <FieldGroup>
            <AppField
              field="submittedAt"
              label="Submitted On"
              :value="ctrl.displaySubmittedAt.value"
              type="date"
            />

            <AppFormField
              v-if="ctrl.isNew.value"
              :field="ctrl.form.Field('justification')"
              label="Justification"
              type="text"
              mode="edit"
            />
            <AppField
              v-else
              field="justification"
              label="Justification"
              :value="ctrl.entity.value?.justification"
              type="text"
            />
          </FieldGroup>

          <FieldGroup>
            <AppFormField
              v-if="ctrl.isNew.value"
              :field="ctrl.form.Field('currency')"
              label="Currency"
              type="text"
              mode="edit"
            />
            <AppField
              v-else
              field="currency"
              label="Currency"
              :value="ctrl.entity.value?.currency"
              type="text"
            />

            <AppField
              v-if="ctrl.isNew.value"
              field="totalAmount"
              label="Order Total"
              :value="
                ctrl.form.state.values.lines?.reduce(
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
              :value="ctrl.entity.value?.totalAmount"
              type="money"
            />
          </FieldGroup>
        </AppFieldset>

        <!-- Middle Section (Tab Bar) -->
        <AppTabs :tabs="['Line Details']" v-model="ctrl.activeTab.value" />

        <!-- Bottom Section (Grid/Content) -->
        <div
          v-if="ctrl.activeTab.value === 'Line Details'"
          class="rounded-lg border border-[var(--color-neutral-200)] overflow-hidden bg-white shadow-sm"
        >
          <DataGrid
            :columns="paymentRequestLineColumns"
            :data="ctrl.currentLines.value"
            :loading="ctrl.isLoading.value && !ctrl.isNew.value"
            empty-message="No line items found"
          />
        </div>
      </form>
    </div>

    <!-- Trace Drawer (Lazy loaded context) -->
    <PaymentRequestTraceDrawer
      v-if="ctrl.entity.value && !ctrl.isNew.value"
      v-model:open="ctrl.isTraceOpen.value"
      :request="ctrl.entity.value"
    />
  </div>
</template>
