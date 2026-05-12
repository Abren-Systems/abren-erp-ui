import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useScreenController, type ScreenStatePolicy } from '@/platform/screen-runtime'
import { useVendorBill } from '../../application/useVendorBill'
import { useCreateVendorBill } from '../../application/useCreateVendorBill'
import { useValidateVendorBill } from '../../application/useValidateVendorBill'
import { useRejectVendorBill } from '../../application/useRejectVendorBill'
import { useCancelVendorBill } from '../../application/useCancelVendorBill'
import { useFormPersistence } from '@/shared/composables/useFormPersistence'
import { toId } from '@/shared/types/brand.types'
import type { VendorBillId } from '@/shared/types/brand.types'
import { AP301000 } from './screen'
import { AP301000_FIELDS } from './fields'
import { useField } from '@/platform/field-system/bindings'
import type { VendorBill, VendorBillStatus } from '../../models/ap.types'

const AP301000_POLICY: ScreenStatePolicy<VendorBillStatus> = {
  states: {
    DRAFT: { editable: true },
    VALIDATED: { editable: false },
    PAID: { editable: false },
    VOIDED: { editable: false },
  },
}

export function useVendorBillController(id: string) {
  const router = useRouter()
  const isNew = computed(() => id === 'new')
  const billId = toId<VendorBillId>(id)

  // Data fetching
  const { vendorBill, operations, isLoading } = useVendorBill(billId)
  const { validate, isPending: isValidating } = useValidateVendorBill(billId)
  const { reject, isPending: isRejecting } = useRejectVendorBill(billId)
  const { cancel, isPending: isCancelling } = useCancelVendorBill(billId)

  // Creation form
  const { form, isSubmitting: isCreating } = useCreateVendorBill()
  useFormPersistence(form, 'abren_draft_vendor_bill')

  const base = useScreenController<VendorBill, VendorBillStatus>({
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

  // Commands
  base.registerCommand('validate', {
    execute: async () => void validate(),
    isPending: isValidating,
  })

  base.registerCommand('reject', {
    execute: async (reason: unknown) => {
      if (typeof reason === 'string') {
        await reject(reason)
      }
    },
    isPending: isRejecting,
  })

  base.registerCommand('cancel', {
    execute: async (reason: unknown) => {
      if (typeof reason === 'string') {
        await cancel(reason)
      }
    },
    isPending: isCancelling,
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
