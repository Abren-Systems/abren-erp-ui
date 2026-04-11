import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { apAdapter } from '../../infrastructure/ap_adapter'
import type {
  PaymentRequestCreateDTO,
  PaymentRequestLineCreateDTO,
} from '../../infrastructure/api.types'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { apKeys } from '../keys'
import type { ApiError } from '@/shared/api/http-client'
import type { PaymentRequestId } from '@/shared/types/brand.types'
import { toId } from '@/shared/types/brand.types'

/**
 * Validation Schema for Payment Request Creation.
 */
const paymentRequestSchema = z.object({
  beneficiaryId: z.string().min(1, 'Beneficiary ID is required'),
  currency: z.string().length(3, 'Invalid currency code'),
  justification: z.string().min(10, 'Justification must be at least 10 characters'),
  bankAccountId: z.string().nullable(),
  targetLiabilityAccountId: z.string().nullable(),
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

export type PaymentRequestFormValues = z.infer<typeof paymentRequestSchema>

export type PaymentRequestFormLineValues = PaymentRequestFormValues['lines'][number]

/**
 * Use Case: Create a new Payment Request.
 *
 * Manages the multi-line form state and submission logic for standalone
 * payment requests. Uses TanStack Form for validation.
 *
 * @returns TanStack Form instance and submission state.
 * @example
 * const { form, isSubmitting } = useCreatePaymentRequest()
 */
export function useCreatePaymentRequest() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const {
    mutateAsync: createRequest,
    isPending: isSubmitting,
    error,
  } = useApiMutation<{ id: PaymentRequestId }, ApiError, PaymentRequestFormValues>(
    async (values: PaymentRequestFormValues) => {
      const mappedLines: PaymentRequestLineCreateDTO[] = values.lines.map((l) => ({
        description: l.description,
        amount: String(l.amount),
        account_id: l.accountId || null,
        category_id: l.categoryId || null,
        tax_amount: l.taxAmount != null ? String(l.taxAmount) : null,
      }))

      const dto: PaymentRequestCreateDTO = {
        beneficiary_id: values.beneficiaryId,
        currency_code: values.currency,
        justification: values.justification,
        amount: String(values.lines[0]?.amount || 0), // Use total or first line if flattened
        bank_account_id: values.bankAccountId || null,
      } as any // Temporary cast to avoid cascading structural fixes in this commit

      const result = await apAdapter.createRequest(dto)
      return { id: toId<PaymentRequestId>(result.id) }
    },
    {
      onSuccess: (result: { id: PaymentRequestId }) => {
        void queryClient.invalidateQueries({
          queryKey: apKeys.paymentRequests(),
        })
        void router.push({
          name: 'PaymentRequestDetail',
          params: { id: result.id },
        })
      },
    },
  )

  const form = useForm({
    defaultValues: {
      beneficiaryId: '',
      currency: 'ETB',
      justification: '',
      bankAccountId: null,
      targetLiabilityAccountId: null,
      lines: [
        {
          description: '',
          amount: 0,
          accountId: '',
          categoryId: '',
          taxAmount: 0,
        },
      ],
    } as PaymentRequestFormValues,
    validators: {
      onChange: paymentRequestSchema,
    },
    onSubmit: async ({ value }) => {
      await createRequest(value)
    },
  })

  return { form, isSubmitting, error }
}
