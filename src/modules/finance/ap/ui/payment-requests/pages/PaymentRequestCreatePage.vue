<script setup lang="ts">
import { useRouter } from 'vue-router'
import { AppButton, AppSelect, AppInput, AppTextarea } from '@/shared/components/primitives'
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
const { form, error: submissionError } = useCreatePaymentRequest()
const { users, isPending: isLoadingUsers } = useUsers()

// Draft Persistence
useFormPersistence(form, 'abren_draft_payment_request')

function goBack() {
  router.push({ name: 'PaymentRequestsList' })
}
</script>

<template>
  <div class="flex h-full flex-col bg-[var(--app-canvas)]">
    <!-- Header -->
    <div
      class="flex shrink-0 items-center justify-between px-8 py-6 bg-white border-b border-[var(--color-neutral-200)]"
    >
      <div class="flex items-center gap-4">
        <AppButton variant="stealth" @click="goBack">
          <ArrowLeft :size="18" />
        </AppButton>
        <div class="p-2 bg-[var(--color-primary-50)] rounded-sm">
          <CreditCard class="h-6 w-6 text-[var(--color-primary-600)]" />
        </div>
        <div>
          <h1 class="m-0 text-xl font-bold tracking-tight text-[var(--color-neutral-900)]">
            New Payment Request
          </h1>
          <p class="mt-1 text-sm text-[var(--color-neutral-500)]">
            Standalone request — accrual entry generated automatically on approval.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <form.Subscribe v-slot="state">
          <AppButton
            variant="primary"
            :disabled="!state.canSubmit || state.isSubmitting"
            @click="form.handleSubmit"
          >
            {{ state.isSubmitting ? 'Creating...' : 'Create Request' }}
          </AppButton>
        </form.Subscribe>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-8">
      <div class="max-w-4xl mx-auto space-y-8">
        <!-- Submission Error -->
        <div
          v-if="submissionError"
          class="bg-[var(--color-danger-50)] border border-[var(--color-danger-200)] p-4 rounded-sm flex items-start gap-3 shadow-sm mb-6"
        >
          <AlertCircle class="h-5 w-5 text-[var(--color-danger-600)] shrink-0" />
          <div>
            <h3 class="text-xs font-bold uppercase tracking-widest text-[var(--color-danger-700)]">
              Error creating request
            </h3>
            <p class="text-xs text-[var(--color-danger-600)] mt-1">
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
          <div
            class="bg-white p-6 rounded-sm border border-[var(--color-neutral-200)] shadow-sm space-y-6"
          >
            <h2
              class="text-xs font-bold uppercase tracking-widest text-[var(--color-neutral-600)] border-b pb-4 -mx-6 px-6"
            >
              Request Metadata
            </h2>

            <form.Field name="beneficiaryId">
              <template #default="{ field, state }">
                <AppSelect
                  label="Beneficiary"
                  :model-value="field.state.value"
                  required
                  :disabled="isLoadingUsers"
                  :error="state.meta.errors[0]"
                  :options="users?.map((u) => ({ label: u.email, value: u.id })) || []"
                  @update:model-value="(val) => field.handleChange(val as string)"
                />
              </template>
            </form.Field>

            <div class="grid grid-cols-2 gap-6">
              <form.Field name="currency">
                <template #default="{ field, state }">
                  <AppSelect
                    label="Currency"
                    :model-value="field.state.value"
                    :options="[
                      { label: 'ETB - Ethiopian Birr', value: 'ETB' },
                      { label: 'USD - US Dollar', value: 'USD' },
                    ]"
                    :error="state.meta.errors[0]"
                    @update:model-value="(val) => field.handleChange(val as string)"
                  />
                </template>
              </form.Field>

              <form.Field name="bankAccountId">
                <template #default="{ field, state }">
                  <AppInput
                    label="Bank Account (Optional)"
                    :model-value="field.state.value ?? ''"
                    placeholder="Leave blank for finance to assign"
                    :error="state.meta.errors[0]"
                    @update:model-value="(val) => field.handleChange((val as string) || null)"
                  />
                </template>
              </form.Field>
            </div>

            <form.Field name="justification">
              <template #default="{ field, state }">
                <AppTextarea
                  label="Justification"
                  :model-value="field.state.value"
                  placeholder="Business justification reviewed by approvers..."
                  required
                  :rows="3"
                  :error="state.meta.errors[0]"
                  @update:model-value="(val) => field.handleChange(val as string)"
                />
              </template>
            </form.Field>
          </div>

          <!-- Line Items -->
          <div
            class="bg-white rounded-sm border border-[var(--color-neutral-200)] shadow-sm space-y-6 overflow-hidden"
          >
            <div
              class="flex items-center justify-between px-6 py-4 border-b bg-[var(--color-neutral-50)]/30"
            >
              <h3
                class="text-xs font-bold uppercase tracking-widest text-[var(--color-neutral-600)]"
              >
                Line Items
              </h3>
              <form.Field name="lines">
                <template #default="{ field }">
                  <AppButton
                    variant="outline"
                    type="button"
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
                    <Plus :size="14" class="mr-2" /> Add Line
                  </AppButton>
                </template>
              </form.Field>
            </div>

            <div class="p-6 pt-0 space-y-6">
              <form.Field name="lines">
                <template #default="{ field }">
                  <div
                    v-for="(_, idx) in field.state.value"
                    :key="idx"
                    class="space-y-6 relative border-b border-[var(--color-neutral-100)] pb-6 last:border-0 last:pb-0 pt-6"
                  >
                    <div class="flex items-center justify-between">
                      <span
                        class="text-[10px] font-bold uppercase tracking-widest text-[var(--color-neutral-400)] bg-[var(--color-neutral-50)] px-2 py-0.5 rounded-sm"
                      >
                        Line #{{ (idx as number) + 1 }}
                      </span>
                      <AppButton
                        variant="stealth"
                        type="button"
                        class="h-7 w-7 text-[var(--color-neutral-400)] hover:text-[var(--color-danger-600)]"
                        :disabled="field.state.value.length === 1"
                        @click="field.removeValue(idx)"
                      >
                        <Trash2 :size="14" />
                      </AppButton>
                    </div>

                    <div class="grid grid-cols-12 gap-6">
                      <form.Field :name="`lines[${idx}].description`" :index="idx">
                        <template #default="{ field: lf, state: ls }">
                          <div class="col-span-12 md:col-span-6">
                            <AppInput
                              label="Description"
                              :model-value="lf.state.value"
                              placeholder="e.g. Monthly Rent"
                              required
                              :error="ls.meta.errors[0]"
                              @update:model-value="(val) => lf.handleChange(val as string)"
                            />
                          </div>
                        </template>
                      </form.Field>

                      <form.Field :name="`lines[${idx}].accountId`" :index="idx">
                        <template #default="{ field: lf, state: ls }">
                          <div class="col-span-12 md:col-span-4 space-y-1.5">
                            <label
                              class="text-[10px] font-bold uppercase tracking-widest text-[var(--color-neutral-500)]"
                              >GL Account *</label
                            >
                            <SelectLedgerAccount
                              :model-value="lf.state.value"
                              @update:model-value="(val) => lf.handleChange(val)"
                            />
                            <p
                              v-if="ls.meta.errors.length"
                              class="text-[10px] text-[var(--color-danger-600)]"
                            >
                              {{ ls.meta.errors[0] }}
                            </p>
                          </div>
                        </template>
                      </form.Field>

                      <form.Field :name="`lines[${idx}].amount`" :index="idx">
                        <template #default="{ field: lf, state: ls }">
                          <div class="col-span-12 md:col-span-2">
                            <AppInput
                              label="Amount"
                              type="number"
                              step="0.01"
                              :model-value="lf.state.value"
                              required
                              :error="ls.meta.errors[0]"
                              class="text-right tabular-nums"
                              @update:model-value="(val) => lf.handleChange(Number(val))"
                            />
                          </div>
                        </template>
                      </form.Field>
                    </div>
                  </div>
                </template>
              </form.Field>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
