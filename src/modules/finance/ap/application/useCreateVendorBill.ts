import { toast } from 'vue-sonner'
import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { apAdapter } from '../infrastructure/ap.adapter'
import type { CreateVendorBillDTO } from '../infrastructure/api.types'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { apKeys } from './query-keys'
import type { ApiError } from '@/shared/api/http-client'
import type { VendorBill } from '../models/ap.types'

/**
 * Validation Schema for Vendor Bill Creation.
 */
const vendorBillSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID is required'),
  vendorInvoiceNumber: z.string().min(1, 'Vendor invoice number is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  currency: z.string().length(3, 'Invalid currency code'),
  justification: z.string().min(1, 'Justification is required'),
  totalAmount: z.coerce.number().positive('Total amount must be positive'),
  lines: z
    .array(
      z.object({
        description: z.string().min(1, 'Description is required'),
        amount: z.coerce.number().nonnegative('Amount must be non-negative'),
        lineType: z.enum(['GOODS', 'SERVICE']),
        accountId: z.string().optional(),
        categoryId: z.string().optional(),
      }),
    )
    .optional()
    .default([]),
})

export type VendorBillFormValues = z.infer<typeof vendorBillSchema>

export type VendorBillFormLineValues = NonNullable<VendorBillFormValues['lines']>[number]

/**
 * Use Case: Create a new Vendor Bill.
 */
export function useCreateVendorBill() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    mutateAsync: createBill,
    isPending: isSubmitting,
    error,
  } = useApiMutation<VendorBill, ApiError, VendorBillFormValues>(
    async (values: VendorBillFormValues) => {
      // If lines are empty, create a default line from totalAmount
      let lines = values.lines || []
      if (lines.length === 0) {
        lines = [
          {
            description: 'General Expense',
            amount: values.totalAmount,
            lineType: 'GOODS',
            accountId: '',
            categoryId: '',
          },
        ]
      } else if (lines.length === 1 && lines[0]!.amount === 0) {
        // If there's one default line with 0 amount, update it with totalAmount
        lines[0]!.amount = values.totalAmount
        if (!lines[0]!.description) lines[0]!.description = 'General Expense'
      }

      const dto: CreateVendorBillDTO = {
        vendor_id: values.vendorId,
        vendor_invoice_number: values.vendorInvoiceNumber,
        issue_date: values.issueDate,
        due_date: values.dueDate,
        currency: values.currency,
        justification: values.justification,
        lines: lines.map((l) => ({
          description: l.description,
          amount: l.amount,
          line_type: l.lineType,
          account_id: l.accountId || null,
          category_id: l.categoryId || null,
        })),
      }
      return await apAdapter.createBill(dto)
    },
    {
      onSuccess: (result: VendorBill) => {
        toast.success('Vendor Bill Registered', {
          description: `Bill ${result.billNumber} has been successfully registered.`,
        })
        void queryClient.invalidateQueries({ queryKey: apKeys.vendorBills() })
        void router.push({
          name: 'VendorBillDetail',
          params: { id: result.id },
        })
      },
      onError: (err: ApiError) => {
        toast.error('Registration Failed', {
          description: err.message || 'An unexpected error occurred.',
        })
      },
    },
  )

  const form = useForm({
    defaultValues: {
      vendorId: '',
      vendorInvoiceNumber: '',
      issueDate: new Date().toISOString().split('T')[0] || '',
      dueDate: new Date().toISOString().split('T')[0] || '',
      currency: 'ETB',
      justification: '',
      totalAmount: 0,
      lines: [] as VendorBillFormLineValues[],
    } as VendorBillFormValues,
    validators: {
      onChange: ({ value }) => {
        const result = vendorBillSchema.safeParse(value)
        if (result.success) return undefined
        return result.error.errors[0]?.message
      },
    },
    onSubmit: async ({ value }) => {
      await createBill(value)
    },
  })

  return { form, isSubmitting, error }
}
