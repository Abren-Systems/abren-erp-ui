import { z } from 'zod'
import { useRouter } from 'vue-router'
import { useQueryClient } from '@tanstack/vue-query'
import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useForm } from '@tanstack/vue-form'
import { apAdapter } from '../infrastructure/ap.adapter'
import { apKeys } from './query-keys'
import { toast } from 'vue-sonner'
import type { ApiError } from '@/shared/api/http-client'
import type { CreateVendorDTO, VendorDTO } from '../infrastructure/api.types'
import type { OperationalEntity } from '@/platform/workflow-runtime/models/workflows.types'

/**
 * Validation Schema for Vendor Creation.
 */
const vendorSchema = z.object({
  name: z.string().min(1, 'Vendor Name is required'),
  tin: z.string().nullable().optional(),
  trade_license_number: z.string().nullable().optional(),
  has_tin_certificate: z.boolean().default(false),
  has_valid_trade_license: z.boolean().default(false),
})

export type VendorFormValues = z.infer<typeof vendorSchema>

/**
 * Use Case: Create a new Vendor.
 */
export function useCreateVendor() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    mutateAsync: createVendor,
    isPending: isSubmitting,
    error: submitError,
  } = useApiMutation<OperationalEntity<VendorDTO>, ApiError, VendorFormValues>(
    async (values: VendorFormValues) => {
      const dto: CreateVendorDTO = {
        name: values.name,
        tin: values.tin,
        trade_license_number: values.trade_license_number,
        has_tin_certificate: values.has_tin_certificate,
        has_valid_trade_license: values.has_valid_trade_license,
      }
      return apAdapter.createVendor(dto)
    },
    {
      onSuccess: (result: OperationalEntity<VendorDTO>) => {
        toast.success('Vendor Registered', {
          description: `Vendor ${result.name} has been created successfully.`,
        })

        void queryClient.invalidateQueries({ queryKey: apKeys.vendors() })

        void router.push({
          name: 'VendorDetail',
          params: { id: result.id },
          replace: true,
        })
      },
      onError: (error: ApiError) => {
        toast.error('Failed to create Vendor', {
          description: error.message || 'An unexpected error occurred.',
        })
      },
    },
  )

  const form = useForm({
    defaultValues: {
      name: '',
      tin: '',
      trade_license_number: '',
      has_tin_certificate: false,
      has_valid_trade_license: false,
    } as VendorFormValues,
    onSubmit: async ({ value }) => {
      await createVendor(value)
    },
  })

  return {
    form,
    isSubmitting,
    submitError,
  }
}
