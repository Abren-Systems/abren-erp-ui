import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { apAdapter } from '../../infrastructure/adapter'
import type { VendorBillCreateDTO } from '../../infrastructure/api.types'
import { useForm } from '@tanstack/vue-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'

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

type VendorBillFormValues = z.infer<typeof vendorBillSchema>

/**
 * Use Case: Create a new Vendor Bill.
 *
 * Handles the multi-line form state and submission for vendor-provided invoices.
 */
export function useCreateVendorBill() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    mutateAsync: createBill,
    isPending: isSubmitting,
    error,
  } = useApiMutation(
    async (values: VendorBillFormValues) => {
      const dto: VendorBillCreateDTO = {
        vendor_id: values.vendorId,
        bill_number: values.billNumber,
        issue_date: values.issueDate,
        due_date: values.dueDate,
        currency: values.currency,
        justification: values.justification,
        lines: values.lines.map((l) => ({
          description: l.description,
          amount: l.amount,
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
    validatorAdapter: zodValidator(),
    validators: {
      onChange: vendorBillSchema,
    },
    onSubmit: async ({ value }: { value: VendorBillFormValues }) => {
      await createBill(value)
    },
  } as unknown as any) // eslint-disable-line @typescript-eslint/no-explicit-any

  return { form, isSubmitting, error }
}
