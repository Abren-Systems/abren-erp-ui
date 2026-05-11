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
  const { bill, isLoading } = useVendorBill(billId)
  const { validate, isPending: isValidating } = useValidateVendorBill(billId)
  const { reject, isPending: isRejecting } = useRejectVendorBill(id)
  const { cancel, isPending: isCancelling } = useCancelVendorBill(billId)

  // Creation form
  const { form, isSubmitting: isCreating } = useCreateVendorBill()
  useFormPersistence(form, 'abren_draft_vendor_bill')

  const base = useScreenController<VendorBill, VendorBillStatus>({
    screen: AP301000,
    dataSource: { entity: bill, isLoading, error: ref(null) },
    isNew,
    getDomainState: (entity) => entity.status,
    statePolicy: AP301000_POLICY,
  })

  // Attach form to base so useField can find it for new records
  Object.assign(base, { form })

  // UI state
  const currentLines = computed(() => bill.value?.lines || [])
  const activeTab = ref('Expense Lines')
  const isRejectDialogOpen = ref(false)
  const auditReason = ref('')
  const activeAuditAction = ref<'reject' | 'cancel' | null>(null)

  // Commands
  base.registerCommand('validate', {
    execute: async () => void validate(),
    isPending: isValidating,
  })

  base.registerCommand('reject', {
    execute: async () => {
      activeAuditAction.value = 'reject'
      auditReason.value = ''
      isRejectDialogOpen.value = true
    },
    isPending: isRejecting,
  })

  const handleRejectConfirm = async () => {
    if (!auditReason.value.trim()) return
    if (activeAuditAction.value === 'reject') {
      await reject(auditReason.value)
    } else if (activeAuditAction.value === 'cancel') {
      await cancel(auditReason.value)
    }
    isRejectDialogOpen.value = false
    activeAuditAction.value = null
  }

  base.registerCommand('create_pr', {
    execute: async () => void router.push({ name: 'PaymentRequestsList' }),
    isPending: computed(() => false),
  })

  base.registerCommand('cancel', {
    execute: async () => {
      activeAuditAction.value = 'cancel'
      auditReason.value = ''
      isRejectDialogOpen.value = true // Reuse reject dialog for cancel reason
    },
    isPending: isCancelling,
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
    isRejectDialogOpen,
    auditReason,
    handleRejectConfirm,
    form,
    isCreating,
    router,
  }
}
