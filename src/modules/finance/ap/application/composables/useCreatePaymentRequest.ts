import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { apAdapter } from '../../infrastructure/ap_adapter'
import type { PaymentRequest } from '../../domain/ap.types'
import type {
  PaymentRequestCreateDTO,
  PaymentRequestLineCreateDTO,
} from '../../infrastructure/api.types'
import { computed, ref } from 'vue'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { apKeys } from '../keys'
import type { ApiError } from '@/shared/api/http-client'

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
  } = useApiMutation<PaymentRequest, ApiError, PaymentRequestFormValues>(
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
        lines: mappedLines,
      } as PaymentRequestCreateDTO

      return await apAdapter.createRequest(dto)
    },
    {
      onSuccess: (result: PaymentRequest) => {
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

  const runningTotal = form.useStore(
    (state) => state.values.lines?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0,
  )

  const validationState = form.useStore((state) => {
    const isValid = state.canSubmit
    let formErrors: string[] = []

    if (state.errorMap?.onChange) {
      if (typeof state.errorMap.onChange === 'string') {
        formErrors = [state.errorMap.onChange]
      } else if (Array.isArray(state.errorMap.onChange)) {
        formErrors = state.errorMap.onChange.map((e) =>
          typeof e === 'string' ? e : (e as { message?: string })?.message || 'Validation error',
        )
      } else {
        formErrors = ['Form validation failed']
      }
    }

    const fieldErrors = Object.values(state.fieldMeta)
      .flatMap((m) => m?.errors || [])
      .filter(Boolean)
      .map((e) => {
        if (typeof e === 'string') return e
        if (e && typeof e === 'object' && 'message' in e)
          return String((e as { message: string }).message)
        return 'Validation error'
      })

    const allErrors = [...formErrors, ...fieldErrors]

    return {
      isValid,
      errors: allErrors,
      errorCount: allErrors.length,
    }
  })

  const isSaved = ref(true)
  form.store.subscribe(() => {
    if (isSaved.value) isSaved.value = false
  })

  const actionBarState = computed(() => {
    if (isSubmitting.value) return 'SUBMITTING'
    if (!validationState.value.isValid && validationState.value.errorCount > 0) return 'ERROR'
    if (isSaved.value) return 'SAVED'
    return 'MODIFIED'
  })

  const totalFormatted = computed(() => {
    return `ETB ${runningTotal.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
  })

  const warnings = form.useStore((state) => {
    const warns: string[] = []
    const total =
      state.values.lines?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0
    if (total > 500000) {
      warns.push('Total amount is unusually large and requires secondary CFO approval.')
    }
    const emptyDescriptions = state.values.lines?.some(
      (l: { description?: string }) => !l.description || l.description.length < 5,
    )
    if (emptyDescriptions) {
      warns.push('Some line items have very brief descriptions. This may delay approval.')
    }
    return warns
  })

  const breakdown = form.useStore((state) => {
    if (!state.values.lines) return []
    const groups = state.values.lines.reduce(
      (acc: Record<string, number>, line: { accountId?: string; amount?: number | string }) => {
        if (!line.accountId) return acc
        // Mocking GL Account lookup for the UX
        const accountLabel = `GL Account (${line.accountId.substring(0, 8) || 'Unknown'})`
        acc[accountLabel] = (acc[accountLabel] || 0) + (Number(line.amount) || 0)
        return acc
      },
      {},
    )

    return Object.entries(groups).map(([label, amount]) => ({
      label,
      amountFormatted: `${state.values.currency || 'ETB'} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    }))
  })

  const saveDraft = async () => {
    const values = form.state.values
    localStorage.setItem('abren_draft_payment_request', JSON.stringify(values))
    console.log('Draft saved:', values)
    isSaved.value = true
  }

  return {
    form,
    isSubmitting,
    error,
    runningTotal,
    totalFormatted,
    validationState,
    actionBarState,
    isSaved,
    warnings,
    breakdown,
    saveDraft,
  }
}
