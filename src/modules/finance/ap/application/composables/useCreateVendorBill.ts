import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQueryClient } from '@tanstack/vue-query'
import { useApiMutation } from '@/shared/composables/useApiMutation'
import { apAdapter } from '../../infrastructure/adapter'
import type { VendorBillCreateDTO } from '../../infrastructure/api.types'

export function useCreateVendorBill() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const form = ref({
    vendorId: '',
    billNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    currency: 'ETB',
    justification: '',
  })

  const lines = ref([
    { description: '', amount: '', accountId: '', categoryId: '', taxRuleId: '', taxAmount: '' },
  ])

  function addLine() {
    lines.value.push({
      description: '',
      amount: '',
      accountId: '',
      categoryId: '',
      taxRuleId: '',
      taxAmount: '',
    })
  }

  function removeLine(idx: number) {
    if (lines.value.length > 1) {
      lines.value.splice(idx, 1)
    }
  }

  const {
    mutateAsync: create,
    isPending: isSubmitting,
    error,
  } = useApiMutation(
    async () => {
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
      return await apAdapter.createBill(dto)
    },
    {
      onSuccess: (result: { id: string }) => {
        void queryClient.invalidateQueries({ queryKey: ['vendor-bills'] })
        void router.push({ name: 'VendorBillDetail', params: { id: result.id } })
      },
    },
  )

  return { form, lines, addLine, removeLine, create, isSubmitting, error }
}
