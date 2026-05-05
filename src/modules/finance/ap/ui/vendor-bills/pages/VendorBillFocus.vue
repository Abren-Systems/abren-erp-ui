<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { AppBadge, AppButton } from '@/shared/components/primitives'
import { AppSelect, AppInput, AppTextarea } from '@/shared/components/primitives'
import { PageHeader, WorkspacePanel, MetricCard } from '@/shared/components/workspace'
import DebouncedCombobox from '@/shared/components/combobox/DebouncedCombobox.vue'
import type { ComboboxOption } from '@/shared/components/combobox/DebouncedCombobox.vue'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  FileText,
  History,
  MoreHorizontal,
  Plus,
  Receipt,
  Trash2,
} from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu'
import { useVendorBill } from '../../../application/useVendorBill'
import { useCreateVendorBill } from '../../../application/useCreateVendorBill'
import { useValidateVendorBill } from '../../../application/useValidateVendorBill'
import { useRejectVendorBill } from '../../../application/useRejectVendorBill'
import { useFormPersistence } from '@/shared/composables/useFormPersistence'
import { usePermissions } from '@/shared/auth/usePermissions'
import VendorBillTraceSidePane from '../components/VendorBillTraceSidePane.vue'
import VendorBillRejectModal from '../components/VendorBillRejectModal.vue'

const props = defineProps<{ id: string }>()
const router = useRouter()
const { hasPermission } = usePermissions()

const isNew = computed(() => props.id === 'new')

// ── Existing bill fetch (only when not new) ────────────────────────────────
const { bill, isLoading } = useVendorBill(props.id)
const { validate, isValidating } = useValidateVendorBill(props.id)
const { reject, isPending: isRejecting } = useRejectVendorBill(props.id)

// ── Creation composable (TanStack form) ───────────────────────────────────
const { form, isSubmitting: isCreating } = useCreateVendorBill()
useFormPersistence(form, 'abren_draft_vendor_bill')

const isTraceOpen = ref(false)
const isRejectModalOpen = ref(false)

const isActionPending = computed(() => isValidating.value || isRejecting.value || isCreating.value)

// ── Derived UI state ───────────────────────────────────────────────────────
const statusVariant = computed<'neutral' | 'success' | 'primary' | 'warning' | 'danger' | 'info'>(
  () => {
    switch (bill.value?.status) {
      case 'VALIDATED':
        return 'success'
      case 'PAID':
        return 'primary'
      default:
        return 'neutral'
    }
  },
)

const summaryCards = computed(() => {
  if (!bill.value) return []
  return [
    {
      label: 'Total amount',
      value: bill.value.totalAmount.format('en-ET'),
      detail: 'Supplier invoice value captured for accrual and payment.',
    },
    {
      label: 'Bill number',
      value: bill.value.billNumber,
      detail: 'Supplier-facing reference used during reconciliation.',
    },
    {
      label: 'Issue date',
      value: new Date(bill.value.issueDate).toLocaleDateString('en-ET'),
      detail: 'When the invoice was issued by the supplier.',
    },
    {
      label: 'Due date',
      value: new Date(bill.value.dueDate).toLocaleDateString('en-ET'),
      detail: 'When the liability is expected to be settled.',
    },
  ]
})

const focusGuidance = computed(() => {
  if (isNew.value)
    return 'Fill in the supplier invoice details and expense lines to register a new vendor bill.'
  switch (bill.value?.status) {
    case 'DRAFT':
      return 'Draft bills should be validated only after invoice details, accounts, and categories are trustworthy.'
    case 'VALIDATED':
      return 'Validated bills are ready to feed the payment-request flow without re-entering the source context.'
    case 'PAID':
      return 'Paid bills are resolved, but trace remains important for audit and supplier follow-up.'
    default:
      return 'Review the bill, validate it into the ledger, and use trace for upstream or downstream context.'
  }
})

// ── Actions ────────────────────────────────────────────────────────────────
async function handleValidate() {
  await validate()
}

async function handleReject(reason: string) {
  await reject(reason)
  isRejectModalOpen.value = false
}

function handleCreatePR() {
  void router.push({ name: 'PaymentRequestsList' })
}

function goBack() {
  void router.push({ name: 'VendorBillsList' })
}

// ── Mocked search options for creation form ────────────────────────────────
const searchVendors = async (q: string): Promise<ComboboxOption[]> => {
  return [
    { value: 'vend-123', label: 'Acme Corp', description: 'vend-123' },
    { value: 'vend-456', label: 'Global Tech', description: 'vend-456' },
    { value: 'vend-789', label: 'Local Supply', description: 'vend-789' },
  ].filter((v) => v.label.toLowerCase().includes(q.toLowerCase()))
}

const searchAccounts = async (q: string): Promise<ComboboxOption[]> => {
  return [
    { value: 'acc-6200', label: '6200 - Office Supplies', description: 'Expense' },
    { value: 'acc-6300', label: '6300 - IT Hardware', description: 'Expense' },
    { value: 'acc-6400', label: '6400 - Travel', description: 'Expense' },
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
  <!-- ── Loading skeleton ─────────────────────────────────────────────── -->
  <div v-if="isLoading && !bill && !isNew" class="flex min-h-[50vh] items-center justify-center">
    <p class="text-sm text-neutral-500">Loading vendor bill...</p>
  </div>

  <!-- ── Creation Mode ─────────────────────────────────────────────────── -->
  <div v-else-if="isNew" class="flex h-full flex-col bg-neutral-50/50">
    <PageHeader title="Register Vendor Bill" :description="focusGuidance">
      <template #icon>
        <Receipt class="h-6 w-6" />
      </template>
      <template #start>
        <AppButton variant="stealth" size="sm" class="h-8 w-8 p-0 -ml-2" @click="goBack">
          <ArrowLeft :size="16" />
        </AppButton>
      </template>
      <template #actions>
        <form.Subscribe v-slot="state">
          <AppButton
            variant="primary"
            :disabled="!state.canSubmit || state.isSubmitting"
            @click="() => form.handleSubmit()"
          >
            {{ state.isSubmitting ? 'Registering...' : 'Register Bill' }}
          </AppButton>
        </form.Subscribe>
      </template>
    </PageHeader>

    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-4xl mx-auto space-y-8">
        <form
          class="space-y-6"
          @submit.prevent="
            (e) => {
              ;(e as Event).stopPropagation()
              form.handleSubmit()
            }
          "
        >
          <!-- Bill Metadata -->
          <div class="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-6">
            <h2
              class="text-[10px] font-bold uppercase tracking-widest text-neutral-400 border-b border-neutral-100 pb-4 -mx-6 px-6"
            >
              Bill Metadata
            </h2>
            <div class="grid grid-cols-2 gap-6">
              <form.Field name="vendorId">
                <template #default="{ field, state }">
                  <div class="space-y-1.5">
                    <label class="text-[10px] font-bold uppercase tracking-widest text-neutral-500"
                      >Vendor *</label
                    >
                    <DebouncedCombobox
                      :model-value="field.state.value"
                      :fetch-options="searchVendors"
                      placeholder="Search vendors..."
                      @update:model-value="(val) => field.handleChange(val as string)"
                    />
                    <p v-if="state.meta.errors.length" class="text-[10px] text-red-600">
                      {{ state.meta.errors[0] }}
                    </p>
                  </div>
                </template>
              </form.Field>

              <form.Field name="vendorInvoiceNumber">
                <template #default="{ field, state }">
                  <AppInput
                    label="Vendor Invoice #"
                    :model-value="field.state.value"
                    placeholder="e.g. INV-2023-001"
                    required
                    :error="state.meta.errors[0]"
                    @update:model-value="(val) => field.handleChange(val as string)"
                  />
                </template>
              </form.Field>
            </div>

            <div class="grid grid-cols-3 gap-6">
              <form.Field name="issueDate">
                <template #default="{ field, state }">
                  <AppInput
                    label="Issue Date"
                    type="date"
                    :model-value="field.state.value"
                    :error="state.meta.errors[0]"
                    @update:model-value="(val) => field.handleChange(val as string)"
                  />
                </template>
              </form.Field>

              <form.Field name="dueDate">
                <template #default="{ field, state }">
                  <AppInput
                    label="Due Date"
                    type="date"
                    :model-value="field.state.value"
                    :error="state.meta.errors[0]"
                    @update:model-value="(val) => field.handleChange(val as string)"
                  />
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
                  placeholder="Description of the purchase..."
                  required
                  :rows="2"
                  :error="state.meta.errors[0]"
                  @update:model-value="(val) => field.handleChange(val as string)"
                />
              </template>
            </form.Field>
          </div>

          <!-- Expense Lines -->
          <div class="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div
              class="flex items-center justify-between px-6 py-3 border-b border-neutral-200 bg-neutral-50/50"
            >
              <h3 class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                Expense Lines
              </h3>
              <form.Field name="lines">
                <template #default="{ field }">
                  <AppButton
                    variant="outline"
                    type="button"
                    @click="
                      field.pushValue({ description: '', amount: 0, accountId: '', categoryId: '' })
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
                              placeholder="e.g. Server Hosting"
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
                        <template #default="{ field: lf }">
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

  <!-- ── Detail / Action Mode ──────────────────────────────────────────── -->
  <div v-else-if="bill" class="space-y-6">
    <PageHeader
      eyebrow="Vendor Bill Focus"
      title="Validate supplier invoice and downstream readiness"
      :description="focusGuidance"
    >
      <template #icon>
        <Receipt class="h-6 w-6" />
      </template>

      <template #actions>
        <AppButton variant="outline" @click="goBack">
          <template #start>
            <ArrowLeft class="h-4 w-4" />
          </template>
          Back to queue
        </AppButton>

        <AppButton variant="outline" @click="isTraceOpen = true">
          <template #start>
            <History class="h-4 w-4" />
          </template>
          Trace
        </AppButton>

        <AppButton
          v-if="bill.status === 'DRAFT' && hasPermission('ap:post')"
          variant="primary"
          :disabled="isActionPending"
          @click="handleValidate"
        >
          <template #start>
            <CheckCircle class="h-4 w-4" />
          </template>
          Validate &amp; Accrue
        </AppButton>

        <AppButton
          v-if="bill.status === 'VALIDATED' && hasPermission('ap:create')"
          variant="primary"
          :disabled="isActionPending"
          @click="handleCreatePR"
        >
          Create Payment Request
        </AppButton>

        <DropdownMenu v-if="bill.status === 'DRAFT' && hasPermission('ap:post')">
          <DropdownMenuTrigger as-child>
            <AppButton variant="stealth">
              <template #start>
                <MoreHorizontal class="h-4 w-4" />
              </template>
            </AppButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuSeparator />
            <DropdownMenuItem class="text-red-700" @click="isRejectModalOpen = true">
              Void draft bill
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </template>
    </PageHeader>

    <div class="flex flex-wrap items-center gap-3 rounded-xl bg-neutral-50 px-4 py-3">
      <AppBadge :variant="statusVariant">{{ bill.status }}</AppBadge>
      <p class="font-mono text-sm text-neutral-500">{{ bill.id }}</p>
      <p class="text-sm text-neutral-600">
        Vendor bills are the source surface. Keep supplier truth clean before triggering payment
        work.
      </p>
    </div>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        v-for="card in summaryCards"
        :key="card.label"
        :title="card.label"
        :value="card.value"
        :subtitle="card.detail"
      />
    </section>

    <section class="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
      <WorkspacePanel
        title="Invoice context"
        description="Read the source narrative before validating, rejecting, or sending it into payment flow."
      >
        <template #icon>
          <AlertTriangle class="h-5 w-5" />
        </template>

        <div class="space-y-5">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
              Justification
            </p>
            <p class="mt-3 text-sm leading-7 text-neutral-700">{{ bill.justification }}</p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="rounded-xl bg-neutral-50 p-4">
              <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                Vendor ID
              </p>
              <p class="mt-2 font-mono text-sm text-neutral-700">{{ bill.vendorId }}</p>
            </div>
            <div class="rounded-xl bg-neutral-50 p-4">
              <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                Currency
              </p>
              <p class="mt-2 font-mono text-sm text-neutral-700">{{ bill.currency }}</p>
            </div>
          </div>
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        title="Expense lines"
        description="Validate the accounting shape of the bill before it becomes a payment decision."
        body-class="space-y-4"
      >
        <template #icon>
          <FileText class="h-5 w-5" />
        </template>

        <div class="overflow-hidden rounded-xl border border-neutral-200">
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-neutral-50">
                <tr>
                  <th
                    class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500"
                  >
                    Description
                  </th>
                  <th
                    class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500"
                  >
                    Amount
                  </th>
                  <th
                    class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500"
                  >
                    GL Account
                  </th>
                  <th
                    class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500"
                  >
                    Category
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[var(--color-neutral-200)] bg-white">
                <tr
                  v-for="(line, index) in bill.lines"
                  :key="line.id ?? `${bill.id}-${index}`"
                  class="transition-colors hover:bg-neutral-50"
                >
                  <td class="px-4 py-3 text-neutral-700">{{ line.description }}</td>
                  <td class="px-4 py-3 text-right font-semibold text-neutral-900">
                    {{ line.amount.format('en-ET') }}
                  </td>
                  <td class="px-4 py-3 font-mono text-xs text-neutral-500">
                    {{ line.accountId ?? 'Not assigned' }}
                  </td>
                  <td class="px-4 py-3 font-mono text-xs text-neutral-500">
                    {{ line.categoryId ?? 'Not assigned' }}
                  </td>
                </tr>
                <tr class="bg-neutral-50 font-semibold">
                  <td class="px-4 py-4 text-neutral-700">Total</td>
                  <td class="px-4 py-4 text-right text-primary-700">
                    {{ bill.totalAmount.format('en-ET') }}
                  </td>
                  <td colspan="2" />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </WorkspacePanel>
    </section>

    <VendorBillTraceSidePane v-model:open="isTraceOpen" :bill="bill" />
    <VendorBillRejectModal
      v-model:open="isRejectModalOpen"
      :is-pending="isRejecting"
      @confirm="handleReject"
    />
  </div>
</template>
