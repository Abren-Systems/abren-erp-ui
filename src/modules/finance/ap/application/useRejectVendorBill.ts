import { toast } from 'vue-sonner'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import { toValue } from 'vue'
import { apAdapter } from '../infrastructure/ap.adapter'
import { apKeys } from './query-keys'
import { toId } from '@/shared/types/brand.types'
import type { VendorBillId } from '@/shared/types/brand.types'
import type { ApiError } from '@/shared/api/http-client'
import type { VendorBill } from '../models/ap.types'

export function useRejectVendorBill(id: string | Ref<string>) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (reason: string) => apAdapter.rejectBill(toValue(id), reason),
    onSuccess: (updatedBill: VendorBill) => {
      // Update individual cache
      queryClient.setQueryData(apKeys.vendorBill(toId<VendorBillId>(toValue(id))), updatedBill)
      // Invalidate list to fresh state
      void queryClient.invalidateQueries({ queryKey: apKeys.vendorBills() })

      toast.success('Vendor Bill Rejected', {
        description: `Bill ${updatedBill.billNumber} has been successfully rejected.`,
      })
    },
    onError: (err: ApiError) => {
      toast.error('Rejection Failed', {
        description: err.message || 'An unexpected error occurred.',
      })
    },
  })

  return {
    reject: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  }
}
