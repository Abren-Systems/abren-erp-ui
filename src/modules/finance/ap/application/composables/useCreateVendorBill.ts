import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { apAdapter } from '../../infrastructure/ap_adapter'
import type { VendorBillCreateDTO } from '../../infrastructure/api.types'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { apKeys } from '../keys'
import type { VendorBillId } from '@/shared/types/brand.types'
import { toId } from '@/shared/types/brand.types'
import type { ApiError } from '@/shared/api/http-client'

/**
 * Validation Schema for Vendor Bill Creation.
 */
const vendorBillSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID is required'),
  billNumber: z.string().min(1, 'Bill number is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  currency: z.string().length(3, 'Invalid currency code'),
  justification: z.string().min(10, 'Justification must be at least 10 characters'),
  lines: z
    .array(
      z.object({
        description: z.string().min(1, 'Description is required'),
        amount: z.coerce.number().positive('Amount must be positive'),
        accountId: z.string(),
        categoryId: z.string(),
      }),
    )
    .min(1, 'At least one line item is required'),
})

export type VendorBillFormValues = z.infer<typeof vendorBillSchema>

export type VendorBillFormLineValues = VendorBillFormValues['lines'][number]

/**
 * Use Case: Create a new Vendor Bill.
 *
 * Handles the multi-line form state and submission for vendor-provided invoices.
 * Uses TanStack Form for validation and Zod for schema enforcement.
 *
 * @returns TanStack Form instance and submission state.
 * @example
 * const { form, isSubmitting } = useCreateVendorBill()
 */
export function useCreateVendorBill() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    mutateAsync: createBill,
    isPending: isSubmitting,
    error,
  } = useApiMutation<{ id: VendorBillId }, ApiError, VendorBillFormValues>(
    async (values: VendorBillFormValues) => {
      const dto: VendorBillCreateDTO = {
        vendor_id: values.vendorId,
        bill_number: values.billNumber,
        issue_date: values.issueDate,
        due_date: values.dueDate,
        currency_code: values.currency,
        justification: values.justification,
        lines: values.lines.map((l) => ({
          description: l.description,
          amount: l.amount,
          account_id: l.accountId || null,
          category_id: l.categoryId || null,
        })),
      }
      const result = await apAdapter.createBill(dto)
      return { id: toId<VendorBillId>(result.id) }
    },
    {
      onSuccess: (result: { id: VendorBillId }) => {
        void queryClient.invalidateQueries({ queryKey: apKeys.vendorBills() })
        void router.push({
          name: 'VendorBillDetail',
          params: { id: result.id },
        })
      },
    },
  )

  const form = useForm({
    defaultValues: {
      vendorId: '',
      billNumber: '',
      issueDate: new Date().toISOString().split('T')[0] || '',
      dueDate: new Date().toISOString().split('T')[0] || '',
      currency: 'ETB',
      justification: '',
      lines: [{ description: '', amount: 0, accountId: '', categoryId: '' }],
    } satisfies VendorBillFormValues,
    validators: {
      onChange: vendorBillSchema,
    },
    onSubmit: async ({ value }) => {
      await createBill(value)
    },
  })

  return { form, isSubmitting, error }
}
