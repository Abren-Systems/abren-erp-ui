import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useScreenController } from '@/platform/screen-runtime'
import { useVendorBill } from '../../application/useVendorBill'
import { useCreateVendorBill } from '../../application/useCreateVendorBill'
import { useValidateVendorBill } from '../../application/useValidateVendorBill'
import { useRejectVendorBill } from '../../application/useRejectVendorBill'
import { useFormPersistence } from '@/shared/composables/useFormPersistence'
import { toId } from '@/shared/types/brand.types'
import type { VendorBillId } from '@/shared/types/brand.types'
import { AP302000 } from './screen'
import { AP302000_FIELDS } from './fields'
import { useField } from '@/platform/field-system/bindings'

export function useVendorBillController(id: string) {
  const router = useRouter()
  const isNew = computed(() => id === 'new')
  const billId = toId<VendorBillId>(id)

  // Data fetching
  const { bill, isLoading } = useVendorBill(billId)
  const { validate, isPending: isValidating } = useValidateVendorBill(billId)
  const { reject, isPending: isRejecting } = useRejectVendorBill(id)

  // Creation form
  const { form, isSubmitting: isCreating } = useCreateVendorBill()
  useFormPersistence(form, 'abren_draft_vendor_bill')

  const base = useScreenController({
    screen: AP302000,
    dataSource: { entity: bill, isLoading, error: ref(null) },
    isNew,
  })

  // Commands
  base.registerCommand('validate', {
    execute: async () => void validate(),
    isPending: isValidating,
  })

  base.registerCommand('reject', {
    execute: async () => void reject('Voided via Data Entry screen'),
    isPending: isRejecting,
  })

  base.registerCommand('create_pr', {
    execute: async () => void router.push({ name: 'PaymentRequestsList' }),
    isPending: computed(() => false),
  })

  const fields = {
    vendorId: useField(base, AP302000_FIELDS.vendorId),
    billNumber: useField(base, AP302000_FIELDS.billNumber),
    vendorInvoiceNumber: useField(base, AP302000_FIELDS.vendorInvoiceNumber),
    issueDate: useField(base, AP302000_FIELDS.issueDate),
    dueDate: useField(base, AP302000_FIELDS.dueDate),
    currency: useField(base, AP302000_FIELDS.currency),
    justification: useField(base, AP302000_FIELDS.justification),
    status: useField(base, AP302000_FIELDS.status),
    totalAmount: useField(base, AP302000_FIELDS.totalAmount),
  }

  const currentLines = computed(() => bill.value?.lines || [])
  const activeTab = ref('Expense Lines')

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
