import { ref } from 'vue'
import { useApiMutation } from '@/core/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { paymentsAdapter } from '../../infrastructure/payments_adapter'
import type {
  PaymentRequestCreateDTO,
  PaymentRequestLineCreateDTO,
} from '../../infrastructure/api.types'

export interface LineFormState {
  description: string
  amount: string
  accountId: string
  categoryId: string
  taxAmount: string
}

export function useCreatePaymentRequest() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const form = ref({
    beneficiaryId: '',
    currency: 'ETB',
    justification: '',
    bankAccountId: '',
  })

  const lines = ref<LineFormState[]>([
    { description: '', amount: '', accountId: '', categoryId: '', taxAmount: '' },
  ])

  function addLine() {
    lines.value.push({ description: '', amount: '', accountId: '', categoryId: '', taxAmount: '' })
  }

  function removeLine(index: number) {
    if (lines.value.length > 1) lines.value.splice(index, 1)
  }

  const {
    mutateAsync: create,
    isPending: isSubmitting,
    error,
  } = useApiMutation(
    async () => {
      const mappedLines: PaymentRequestLineCreateDTO[] = lines.value.map((l) => ({
        description: l.description,
        amount: parseFloat(l.amount),
        account_id: l.accountId || null,
        category_id: l.categoryId || null,
        tax_amount: l.taxAmount ? parseFloat(l.taxAmount) : null,
      }))

      const dto: PaymentRequestCreateDTO = {
        beneficiary_id: form.value.beneficiaryId,
        currency: form.value.currency,
        justification: form.value.justification,
        lines: mappedLines,
        bank_account_id: form.value.bankAccountId || null,
      }

      return await paymentsAdapter.create(dto)
    },
    {
      onSuccess: (result: { id: string }) => {
        void queryClient.invalidateQueries({ queryKey: ['payment-requests'] })
        void router.push({ name: 'PaymentRequestDetail', params: { id: result.id } })
      },
    },
  )

  return { form, lines, addLine, removeLine, create, isSubmitting, error }
}
