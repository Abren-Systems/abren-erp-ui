<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { AppButton, AppSelect, AppInput, AppTextarea } from '@/shared/components/primitives'
import DebouncedCombobox from '@/shared/components/combobox/DebouncedCombobox.vue'
import type { ComboboxOption } from '@/shared/components/combobox/DebouncedCombobox.vue'
import FileUploadZone from '@/shared/components/dropzone/FileUploadZone.vue'
import { useCreatePaymentRequest } from '../../../application/composables/useCreatePaymentRequest'
import { useFormPersistence } from '@/shared/composables/useFormPersistence'
import { Trash2, Plus, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-vue-next'
import { PageHeader } from '@/shared/components/workspace'

const router = useRouter()
const { form, error: submissionError } = useCreatePaymentRequest()

const showSourceDoc = ref(false)
const sourceFile = ref<File | null>(null)
const sourceFileUrl = ref<string | null>(null)

useFormPersistence(form, 'abren_draft_payment_request')

function goBack() {
  router.push({ name: 'PaymentRequestsList' })
}

function handleFileSelected(file: File) {
  sourceFile.value = file
  if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
    sourceFileUrl.value = URL.createObjectURL(file)
  }
}

function handleFileCleared() {
  sourceFile.value = null
  if (sourceFileUrl.value) {
    URL.revokeObjectURL(sourceFileUrl.value)
    sourceFileUrl.value = null
  }
}

const searchBeneficiaries = async (q: string): Promise<ComboboxOption[]> => {
  return [
    { value: 'vend-123', label: 'Acme Corp', description: 'vend-123' },
    { value: 'emp-456', label: 'John Doe', description: 'emp-456' },
  ].filter((v) => v.label.toLowerCase().includes(q.toLowerCase()))
}

const searchAccounts = async (q: string): Promise<ComboboxOption[]> => {
  return [
    { value: 'acc-6200', label: '6200 - Office Supplies', description: 'Expense' },
    { value: 'acc-6300', label: '6300 - IT Hardware', description: 'Expense' },
  ].filter((v) => v.label.toLowerCase().includes(q.toLowerCase()) || v.value.includes(q))
}

const searchCategories = async (q: string): Promise<ComboboxOption[]> => {
  return [
    { value: 'cat-opex', label: 'OPEX - Operations', description: 'cat-opex' },
    { value: 'cat-capex', label: 'CAPEX - Capital', description: 'cat-capex' },
  ].filter((v) => v.label.toLowerCase().includes(q.toLowerCase()))
}
</script>

<template>
  <div class="flex h-full flex-col bg-neutral-50/50">
    <PageHeader
      title="Create Payment Request"
      description="Request a disbursement or employee reimbursement."
    >
      <template #start>
        <AppButton variant="stealth" size="sm" class="h-8 w-8 p-0 -ml-2" @click="goBack">
          <ArrowLeft :size="16" />
        </AppButton>
      </template>

      <template #actions>
        <AppButton variant="outline" @click="showSourceDoc = !showSourceDoc">
          <Eye v-if="!showSourceDoc" :size="14" class="mr-2" />
          <EyeOff v-else :size="14" class="mr-2" />
          {{ showSourceDoc ? 'Hide Doc' : 'View Source' }}
        </AppButton>
        <form.Subscribe v-slot="state">
          <AppButton
            variant="primary"
            :disabled="!state.canSubmit || state.isSubmitting"
            @click="() => form.handleSubmit()"
          >
            {{ state.isSubmitting ? 'Submitting...' : 'Submit Request' }}
          </AppButton>
        </form.Subscribe>
      </template>
    </PageHeader>

    <div class="flex-1 overflow-hidden flex min-h-0">
      <aside
        v-if="showSourceDoc"
        class="w-[450px] border-r border-neutral-200 bg-neutral-50 flex flex-col h-full overflow-hidden"
      >
        <div
          class="p-4 border-b border-neutral-200 bg-white flex items-center justify-between shrink-0"
        >
          <h2 class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Source Document
          </h2>
          <span v-if="sourceFile" class="text-[10px] font-mono text-neutral-500">{{
            sourceFile.name
          }}</span>
        </div>

        <div class="flex-1 overflow-auto p-4 relative flex flex-col items-center justify-center">
          <FileUploadZone
            v-if="!sourceFile"
            accept="application/pdf,image/*"
            :max-size-m-b="10"
            @file-selected="handleFileSelected"
          />

          <template v-else-if="sourceFileUrl">
            <iframe
              v-if="sourceFile.type === 'application/pdf'"
              :src="sourceFileUrl"
              class="w-full h-full rounded-xl shadow-sm border border-neutral-200"
            ></iframe>
            <img
              v-else
              :src="sourceFileUrl"
              class="max-w-full rounded-xl shadow-sm border border-neutral-200"
              alt="Source Document"
            />
          </template>

          <div v-if="sourceFile" class="absolute bottom-6 flex justify-center w-full">
            <AppButton variant="danger" class="shadow-lg" @click="handleFileCleared">
              <Trash2 :size="14" class="mr-2" /> Remove Attachment
            </AppButton>
          </div>
        </div>
      </aside>

      <div class="flex-1 overflow-y-auto p-6 bg-neutral-50/50">
        <div class="max-w-4xl mx-auto space-y-8">
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
                {{ submissionError.message ?? 'An unexpected error occurred.' }}
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
            <div class="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-6">
              <h2
                class="text-[10px] font-bold uppercase tracking-widest text-neutral-400 border-b border-neutral-100 pb-4 -mx-6 px-6"
              >
                Request Details
              </h2>
              <div class="grid grid-cols-2 gap-6">
                <form.Field name="beneficiaryId">
                  <template #default="{ field, state }">
                    <div class="space-y-1.5">
                      <label
                        class="text-[10px] font-bold uppercase tracking-widest text-neutral-500"
                        >Beneficiary *</label
                      >
                      <DebouncedCombobox
                        :model-value="field.state.value"
                        :fetch-options="searchBeneficiaries"
                        placeholder="Search beneficiaries..."
                        @update:model-value="(val) => field.handleChange(val as string)"
                      />
                      <p v-if="state.meta.errors.length" class="text-[10px] text-red-600">
                        {{ state.meta.errors[0] }}
                      </p>
                    </div>
                  </template>
                </form.Field>

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
              </div>

              <form.Field name="justification">
                <template #default="{ field, state }">
                  <AppTextarea
                    label="Justification"
                    :model-value="field.state.value"
                    placeholder="Description of the request..."
                    required
                    :rows="2"
                    :error="state.meta.errors[0]"
                    @update:model-value="(val) => field.handleChange(val as string)"
                  />
                </template>
              </form.Field>
            </div>

            <div class="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
              <div
                class="flex items-center justify-between px-6 py-3 border-b border-neutral-200 bg-neutral-50/50"
              >
                <h3 class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
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
                      class="space-y-6 relative border-b border-neutral-100 pb-6 last:border-0 last:pb-0 pt-6"
                    >
                      <div class="flex items-center justify-between">
                        <span
                          class="text-[10px] font-bold uppercase tracking-widest text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded-sm"
                        >
                          Line #{{ (idx as number) + 1 }}
                        </span>
                        <AppButton
                          variant="stealth"
                          type="button"
                          class="h-7 w-7 text-neutral-400 hover:text-red-600"
                          :disabled="field.state.value.length === 1"
                          @click="field.removeValue(idx)"
                        >
                          <Trash2 :size="14" />
                        </AppButton>
                      </div>

                      <div class="grid grid-cols-12 gap-6">
                        <form.Field :name="`lines[${idx}].description`" :index="idx">
                          <template #default="{ field: lf, state: ls }">
                            <div class="col-span-12">
                              <AppInput
                                label="Description"
                                :model-value="lf.state.value"
                                placeholder="e.g. Travel expenses"
                                required
                                :error="ls.meta.errors[0]"
                                @update:model-value="(val) => lf.handleChange(val as string)"
                              />
                            </div>
                          </template>
                        </form.Field>

                        <form.Field :name="`lines[${idx}].amount`" :index="idx">
                          <template #default="{ field: lf, state: ls }">
                            <div class="col-span-4">
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

                        <form.Field :name="`lines[${idx}].accountId`" :index="idx">
                          <template #default="{ field: lf, state: ls }">
                            <div class="col-span-4 space-y-1.5">
                              <label
                                class="text-[10px] font-bold uppercase tracking-widest text-neutral-500"
                                >GL Account</label
                              >
                              <DebouncedCombobox
                                :model-value="lf.state.value"
                                :fetch-options="searchAccounts"
                                placeholder="Search accounts..."
                                @update:model-value="(val) => lf.handleChange(val as string)"
                              />
                              <p v-if="ls.meta.errors.length" class="text-[10px] text-red-600">
                                {{ ls.meta.errors[0] }}
                              </p>
                            </div>
                          </template>
                        </form.Field>

                        <form.Field :name="`lines[${idx}].categoryId`" :index="idx">
                          <template #default="{ field: lf, state: ls }">
                            <div class="col-span-4 space-y-1.5">
                              <label
                                class="text-[10px] font-bold uppercase tracking-widest text-neutral-500"
                                >Category</label
                              >
                              <DebouncedCombobox
                                :model-value="lf.state.value"
                                :fetch-options="searchCategories"
                                placeholder="Search categories..."
                                @update:model-value="(val) => lf.handleChange(val as string)"
                                @keydown.enter.prevent="
                                  () => {
                                    if (idx === field.state.value.length - 1) {
                                      field.pushValue({
                                        description: '',
                                        amount: 0,
                                        accountId: '',
                                        categoryId: '',
                                        taxAmount: 0,
                                      })
                                    }
                                  }
                                "
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
  </div>
</template>
