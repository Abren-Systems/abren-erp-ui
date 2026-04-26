<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { AppButton, AppSelect, AppInput, AppTextarea } from '@/shared/components/primitives'
import { PageHeader, FormSummaryPanel } from '@/shared/components/workspace'
import { useCreatePaymentRequest } from '../../../application/composables/useCreatePaymentRequest'
import { useFormPersistence } from '@/shared/composables/useFormPersistence'
import { Trash2, Plus, AlertCircle, ArrowLeft, CreditCard } from 'lucide-vue-next'
import { useUsers } from '@/modules/core/application/composables/useUsers'
import SelectLedgerAccount from '@/shared/components/finance/SelectLedgerAccount.vue'

/**
 * PaymentRequestCreatePage — Dedicated creation form.
 *
 * Uses the Macro-Create pattern (Full Page) to support complex
 * tabular line items and maximum data density.
 */

const router = useRouter()
const {
  form,
  error: submissionError,
  isSubmitting,
  runningTotal,
  validationState,
  warnings,
  breakdown,
  saveDraft,
} = useCreatePaymentRequest()

const isSaved = ref(true) // Mock local persistence state for feedback
// Listen for form changes to clear the saved state
form.store.subscribe(() => {
  if (isSaved.value) isSaved.value = false
})
const { users, isPending: isLoadingUsers } = useUsers()

// UX Context Mocks (Not yet in API Schema)
const requestType = ref('VENDOR_PAYMENT')
const priority = ref('NORMAL')

// Draft Persistence
useFormPersistence(form, 'abren_draft_payment_request')

function goBack() {
  router.push({ name: 'PaymentRequestsList' })
}
</script>

<template>
  <div class="flex h-full flex-col bg-neutral-50/50">
    <!-- Header -->
    <PageHeader
      title="New Payment Request"
      description="Standalone request — accrual entry generated automatically on approval."
    >
      <template #start>
        <AppButton variant="stealth" size="sm" class="h-8 w-8 p-0 -ml-2" @click="goBack">
          <ArrowLeft :size="16" />
        </AppButton>
      </template>
    </PageHeader>

    <!-- Mobile Sticky Summary (visible < xl) -->
    <div
      class="xl:hidden sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-sm p-4 flex justify-between items-center"
    >
      <div class="flex flex-col">
        <span class="text-[10px] uppercase text-neutral-500 font-bold tracking-wider"
          >Total Amount</span
        >
        <span class="text-lg font-bold tabular-nums tracking-tight"
          >ETB {{ runningTotal.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</span
        >
      </div>
      <AppBadge
        v-if="!validationState.isValid && validationState.errorCount > 0"
        variant="destructive"
        class="text-[10px]"
      >
        {{ validationState.errorCount }} Errors
      </AppBadge>
      <AppBadge
        v-else-if="warnings?.length"
        class="bg-amber-100 text-amber-700 hover:bg-amber-100 text-[10px]"
      >
        {{ warnings.length }} Warnings
      </AppBadge>
      <AppBadge v-else class="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px]">
        Valid
      </AppBadge>
    </div>

    <div class="flex-1 overflow-y-auto p-6 scrollbar-thin pb-24">
      <div class="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">
        <!-- Left Column: Form Execution Surface -->
        <div class="space-y-6 flex-1 min-w-0">
          <!-- Submission Error -->
          <div
            v-if="submissionError"
            class="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3 shadow-sm mb-6"
          >
            <AlertCircle class="h-5 w-5 text-red-600 shrink-0" />
            <div>
              <h3 class="text-[10px] font-bold uppercase tracking-widest text-red-700">
                Error creating request
              </h3>
              <p class="text-xs text-red-600 mt-1">
                {{ submissionError.detail ?? 'An unexpected error occurred.' }}
              </p>
            </div>
          </div>

          <form
            class="space-y-6"
            @submit.prevent="
              (e) => {
                ;(e as Event).stopPropagation()
                form.handleSubmit()
              }
            "
          >
            <!-- Request Metadata -->
            <div class="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-6">
              <h2
                class="text-[10px] font-bold uppercase tracking-widest text-neutral-400 border-b pb-4 -mx-6 px-6"
              >
                General Information
              </h2>

              <div class="grid grid-cols-12 gap-6">
                <div class="col-span-12 md:col-span-5">
                  <form.Field name="beneficiaryId">
                    <template #default="{ field, state }">
                      <AppSelect
                        label="Beneficiary Vendor"
                        :model-value="field.state.value"
                        required
                        :disabled="isLoadingUsers"
                        :error="state.meta.errors[0]"
                        :options="users?.map((u) => ({ label: u.email, value: u.id })) || []"
                        @update:model-value="(val) => field.handleChange(val as string)"
                      />
                    </template>
                  </form.Field>
                </div>

                <div class="col-span-12 md:col-span-3">
                  <AppSelect
                    label="Request Type"
                    v-model="requestType"
                    :options="[
                      { label: 'Vendor Payment', value: 'VENDOR_PAYMENT' },
                      { label: 'Employee Expense', value: 'EMPLOYEE_EXPENSE' },
                      { label: 'Advance', value: 'ADVANCE' },
                    ]"
                  />
                </div>

                <div class="col-span-12 md:col-span-2">
                  <AppSelect
                    label="Priority"
                    v-model="priority"
                    :options="[
                      { label: 'Normal', value: 'NORMAL' },
                      { label: 'High', value: 'HIGH' },
                      { label: 'Urgent', value: 'URGENT' },
                    ]"
                  />
                </div>

                <div class="col-span-12 md:col-span-2">
                  <form.Field name="currency">
                    <template #default="{ field, state }">
                      <AppSelect
                        label="Currency"
                        :model-value="field.state.value"
                        :options="[
                          { label: 'ETB', value: 'ETB' },
                          { label: 'USD', value: 'USD' },
                        ]"
                        :error="state.meta.errors[0]"
                        @update:model-value="(val) => field.handleChange(val as string)"
                      />
                    </template>
                  </form.Field>
                </div>

                <div class="col-span-12">
                  <form.Field name="justification">
                    <template #default="{ field, state }">
                      <AppTextarea
                        label="Description / Justification"
                        :model-value="field.state.value"
                        placeholder="Explain the purpose of this request for approval review..."
                        required
                        :rows="2"
                        :error="state.meta.errors[0]"
                        @update:model-value="(val) => field.handleChange(val as string)"
                      />
                    </template>
                  </form.Field>
                </div>
              </div>
            </div>

            <!-- Line Items Section -->
            <div class="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
              <div
                class="flex items-center justify-between px-6 py-3 bg-neutral-50/50 border-b border-neutral-200"
              >
                <h3 class="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  Request Line Items
                </h3>
                <form.Field name="lines">
                  <template #default="{ field }">
                    <AppButton
                      variant="stealth"
                      size="sm"
                      type="button"
                      class="h-7 text-xs"
                      @click="
                        field.pushValue({
                          description: '',
                          amount: 0,
                          accountId: '',
                          categoryId: '',
                          taxAmount: 0,
                        })
                      "
                    >
                      <template #start>
                        <Plus :size="14" />
                      </template>
                      Add Line Item
                    </AppButton>
                  </template>
                </form.Field>
              </div>

              <div class="p-0">
                <form.Field name="lines">
                  <template #default="{ field }">
                    <div
                      v-for="(_, idx) in field.state.value"
                      :key="idx"
                      class="group relative border-b border-neutral-100 last:border-0 hover:bg-neutral-50/30 transition-colors"
                    >
                      <div class="p-6">
                        <div class="flex items-center justify-between mb-4">
                          <span
                            class="text-[9px] font-bold uppercase tracking-widest text-neutral-400 border border-neutral-200 px-2 py-0.5 rounded-md"
                          >
                            Line Item #{{ (idx as number) + 1 }}
                          </span>
                          <AppButton
                            v-if="field.state.value.length > 1"
                            variant="stealth"
                            type="button"
                            class="h-6 w-6 p-0 text-neutral-300 hover:text-red-500 transition-colors"
                            @click="field.removeValue(idx)"
                          >
                            <Trash2 :size="14" />
                          </AppButton>
                        </div>

                        <div class="grid grid-cols-12 gap-4 items-start">
                          <!-- GL Account (Primary Structure) -->
                          <form.Field :name="`lines[${idx}].accountId`" :index="idx">
                            <template #default="{ field: lf, state: ls }">
                              <div class="col-span-12 lg:col-span-4 flex flex-col gap-1">
                                <SelectLedgerAccount
                                  :model-value="lf.state.value"
                                  placeholder="Select GL Account..."
                                  class="h-9"
                                  :class="ls.meta.errors.length ? 'ring-1 ring-red-500' : ''"
                                  @update:model-value="(val) => lf.handleChange(val)"
                                />
                                <p
                                  v-if="ls.meta.errors.length"
                                  class="text-[9px] text-red-600 font-medium"
                                >
                                  {{ ls.meta.errors[0] }}
                                </p>
                              </div>
                            </template>
                          </form.Field>

                          <!-- Description -->
                          <form.Field :name="`lines[${idx}].description`" :index="idx">
                            <template #default="{ field: lf, state: ls }">
                              <div class="col-span-12 lg:col-span-6">
                                <AppInput
                                  :model-value="lf.state.value"
                                  placeholder="Description of expense..."
                                  required
                                  :error="ls.meta.errors[0]"
                                  class="h-9"
                                  @update:model-value="(val) => lf.handleChange(val as string)"
                                  @keydown.enter.prevent="
                                    field.pushValue({
                                      description: '',
                                      amount: 0,
                                      accountId: '',
                                      categoryId: '',
                                      taxAmount: 0,
                                    })
                                  "
                                />
                              </div>
                            </template>
                          </form.Field>

                          <!-- Amount -->
                          <form.Field :name="`lines[${idx}].amount`" :index="idx">
                            <template #default="{ field: lf, state: ls }">
                              <div class="col-span-12 lg:col-span-2">
                                <AppInput
                                  type="number"
                                  step="0.01"
                                  :model-value="lf.state.value"
                                  required
                                  :error="ls.meta.errors[0]"
                                  class="text-right tabular-nums font-semibold h-9"
                                  @update:model-value="(val) => lf.handleChange(Number(val))"
                                  @keydown.enter.prevent="
                                    field.pushValue({
                                      description: '',
                                      amount: 0,
                                      accountId: '',
                                      categoryId: '',
                                      taxAmount: 0,
                                    })
                                  "
                                />
                              </div>
                            </template>
                          </form.Field>
                        </div>
                      </div>
                    </div>
                  </template>
                </form.Field>
              </div>
            </div>
          </form>
        </div>

        <!-- Right Column: Financial Overview -->
        <aside class="hidden xl:block sticky top-6">
          <FormSummaryPanel
            :total-formatted="`ETB ${runningTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`"
            :line-count="form.state.values.lines?.length || 0"
            status="DRAFT"
            :validation-state="validationState"
            :warnings="warnings"
            :breakdown="breakdown"
          >
            <template #actions>
              <AppButton
                class="w-full"
                variant="primary"
                :loading="isSubmitting"
                :disabled="!validationState.isValid || runningTotal <= 0"
                @click="form.handleSubmit"
              >
                Submit Request
              </AppButton>
            </template>
          </FormSummaryPanel>
        </aside>
      </div>
    </div>

    <!-- Sticky Bottom Action Bar -->
    <div
      class="fixed bottom-0 left-0 right-0 border-t border-neutral-200 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 flex items-center justify-between"
    >
      <div class="text-xs flex items-center gap-2 px-4 max-w-7xl mx-auto w-full">
        <!-- State Feedback -->
        <div class="flex items-center gap-2 flex-1 font-medium">
          <template v-if="isSubmitting">
            <span class="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span class="text-blue-600">Submitting for Approval...</span>
          </template>
          <template v-else-if="!validationState.isValid && validationState.errorCount > 0">
            <span class="inline-block w-2 h-2 rounded-full bg-red-500"></span>
            <span class="text-red-600">Cannot submit. Please resolve errors.</span>
          </template>
          <template v-else-if="isSaved">
            <span class="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span class="text-emerald-600">Draft saved locally ✓</span>
          </template>
          <template v-else>
            <span class="inline-block w-2 h-2 rounded-full bg-amber-400"></span>
            <span class="text-amber-600">Unsaved changes</span>
          </template>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <AppButton
            variant="outline"
            @click="
              () => {
                saveDraft()
                isSaved = true
              }
            "
          >
            Save as Draft
          </AppButton>
          <AppButton
            variant="primary"
            :loading="isSubmitting"
            :disabled="!validationState.isValid || runningTotal <= 0"
            @click="form.handleSubmit"
          >
            Submit Request
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>
