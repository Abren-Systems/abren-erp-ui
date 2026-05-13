import { computed, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useScreenController } from '@/platform/screen-runtime'
import { useWorkflowAction } from '@/platform/workflow-runtime/hooks/useWorkflowAction'
import { useVendorBill } from '../../application/useVendorBill'
import { useCreateVendorBill } from '../../application/useCreateVendorBill'
import { apAdapter } from '../../infrastructure/ap.adapter'
import { useFormPersistence } from '@/shared/composables/useFormPersistence'
import { toId } from '@/shared/types/brand.types'
import type { VendorBillId } from '@/shared/types/brand.types'
import { AP301000 } from './screen'
import { AP301000_FIELDS } from './fields'
import { useField } from '@/platform/field-system/bindings'
import type { VendorBill } from '../../models/ap.types'
import { AP301000_POLICY } from './policy'

export function useVendorBillController(id: string) {
  const router = useRouter()
  const isNew = computed(() => id === 'new')
  const billId = toId<VendorBillId>(id)

  // Data fetching
  const { vendorBill, operations, isLoading } = useVendorBill(billId)

  // Workflow Actions (Unified Runtime)
  const { dispatch, isLoading: isExecutingAction } = useWorkflowAction<VendorBill>({
    id,
    version: computed(() => operations.value?.version ?? 0),
    execute: (id, action, version, payload) =>
      apAdapter.executeBillAction(id, action, version, payload),
    queryKey: ['ap', 'vendor-bills', 'detail', id],
  })

  // Creation form
  const { form, isSubmitting: isCreating } = useCreateVendorBill()
  useFormPersistence(form, 'abren_draft_vendor_bill')

  const base = useScreenController<VendorBill, string>({
    screen: AP301000,
    dataSource: { entity: vendorBill, isLoading, error: ref(null) },
    isNew,
    getDomainState: (entity) => entity.status,
    operations,
    statePolicy: AP301000_POLICY,
  })

  // Attach form to base so useField can find it for new records
  Object.assign(base, { form })

  // UI state
  const currentLines = computed(() => vendorBill.value?.lines || [])
  const activeTab = ref('Expense Lines')

  // Dynamic Command Registration
  watchEffect(() => {
    const actions = operations.value?.actions
    if (!actions) return
    actions.forEach((action) => {
      base.registerCommand(action.action, {
        execute: async (payload) => dispatch(action, payload as Record<string, unknown>),
        isPending: isExecutingAction,
      })
    })
  })

  // Static Commands
  base.registerCommand('save', {
    execute: async () => {
      void form.handleSubmit()
    },
    isPending: isCreating,
  })

  base.registerCommand('create_pr', {
    execute: async () => void router.push({ name: 'PaymentRequestsList' }),
    isPending: computed(() => false),
  })

  const fields = {
    vendorId: useField(base, AP301000_FIELDS.vendorId),
    billNumber: useField(base, AP301000_FIELDS.billNumber),
    vendorInvoiceNumber: useField(base, AP301000_FIELDS.vendorInvoiceNumber),
    issueDate: useField(base, AP301000_FIELDS.issueDate),
    dueDate: useField(base, AP301000_FIELDS.dueDate),
    currency: useField(base, AP301000_FIELDS.currency),
    justification: useField(base, AP301000_FIELDS.justification),
    status: useField(base, AP301000_FIELDS.status),
    totalAmount: useField(base, AP301000_FIELDS.totalAmount),
  }

  return {
    ...base,
    fields,
    currentLines,
    activeTab,
    form,
    isCreating,
    router,
  }
}
