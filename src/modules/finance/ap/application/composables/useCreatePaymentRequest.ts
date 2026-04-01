import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { apAdapter } from '../../infrastructure/adapter'
import type {
  PaymentRequestCreateDTO,
  PaymentRequestLineCreateDTO,
} from '../../infrastructure/api.types'
import { useForm } from '@tanstack/vue-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'

/**
 * Validation Schema for Payment Request Creation.
 */
const paymentRequestSchema = z.object({
  beneficiaryId: z.string().min(1, 'Beneficiary ID is required'),
  currency: z.string().length(3, 'Invalid currency code'),
  justification: z.string().min(10, 'Justification must be at least 10 characters'),
  bankAccountId: z.string(),
  lines: z
    .array(
      z.object({
        description: z.string().min(1, 'Description is required'),
        amount: z.coerce.number().positive('Amount must be positive'),
        accountId: z.string(),
        categoryId: z.string(),
        taxAmount: z.coerce.number(),
      }),
    )
    .min(1, 'At least one line item is required'),
})

type PaymentRequestFormValues = z.infer<typeof paymentRequestSchema>

/**
 * Use Case: Create a new Payment Request.
 *
 * Manages the multi-line form state and submission logic for standalone
 * payment requests.
 */
export function useCreatePaymentRequest() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const {
    mutateAsync: createRequest,
    isPending: isSubmitting,
    error,
  } = useApiMutation(
    async (values: PaymentRequestFormValues) => {
      const mappedLines: PaymentRequestLineCreateDTO[] = values.lines.map((l) => ({
        description: l.description,
        amount: l.amount,
        account_id: l.accountId || null,
        category_id: l.categoryId || null,
        tax_amount: l.taxAmount ?? null,
      }))

      const dto: PaymentRequestCreateDTO = {
        beneficiary_id: values.beneficiaryId,
        currency: values.currency,
        justification: values.justification,
        lines: mappedLines,
        bank_account_id: values.bankAccountId || null,
      }

      return await apAdapter.createRequest(dto)
    },
    {
      onSuccess: (result: { id: string }) => {
        void queryClient.invalidateQueries({ queryKey: ['payment-requests'] })
        void router.push({ name: 'PaymentRequestDetail', params: { id: result.id } })
      },
    },
  )

  const form = useForm({
    defaultValues: {
      beneficiaryId: '',
      currency: 'ETB',
      justification: '',
      bankAccountId: '',
      lines: [{ description: '', amount: 0, accountId: '', categoryId: '', taxAmount: 0 }],
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: paymentRequestSchema,
    },
    onSubmit: async ({ value }: { value: PaymentRequestFormValues }) => {
      await createRequest(value)
    },
  } as unknown as any) // eslint-disable-line @typescript-eslint/no-explicit-any

  return { form, isSubmitting, error }
}
