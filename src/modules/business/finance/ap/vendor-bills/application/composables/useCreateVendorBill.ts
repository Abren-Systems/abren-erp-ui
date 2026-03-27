import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { vendorBillsAdapter } from '../../infrastructure/vendor_bills_adapter'
import type { VendorBillCreateDTO } from '../../infrastructure/api.types'

export function useCreateVendorBill() {
  const router = useRouter()
  const isSubmitting = ref(false)

  const form = ref({
    vendorId: '',
    billNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    currency: 'ETB',
    justification: '',
  })

  const lines = ref([{ description: '', amount: '', accountId: '', categoryId: '' }])

  function addLine() {
    lines.value.push({ description: '', amount: '', accountId: '', categoryId: '' })
  }

  function removeLine(idx: number) {
    if (lines.value.length > 1) {
      lines.value.splice(idx, 1)
    }
  }

  async function create() {
    isSubmitting.value = true
    try {
      const dto: VendorBillCreateDTO = {
        vendor_id: form.value.vendorId,
        bill_number: form.value.billNumber,
        issue_date: form.value.issueDate || '',
        due_date: form.value.dueDate || '',
        currency: form.value.currency,
        justification: form.value.justification,
        lines: lines.value
          .filter((l) => l.description && l.amount)
          .map((l) => ({
            description: l.description,
            amount: parseFloat(l.amount),
            account_id: l.accountId || null,
            category_id: l.categoryId || null,
          })),
      }
      const created = await vendorBillsAdapter.create(dto)
      void router.push({ name: 'VendorBillDetail', params: { id: created.id } })
    } catch (err: unknown) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Failed to create bill')
    } finally {
      isSubmitting.value = false
    }
  }

  return { form, lines, addLine, removeLine, create, isSubmitting }
}
