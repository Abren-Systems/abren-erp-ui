/**
 * Query Key Factory for Accounts Payable Module
 *
 * Centralized source of truth for TanStack Query keys.
 */
import type { PaymentRequestId, VendorBillId } from '@/shared/types/brand.types'

export const apKeys = {
  all: ['ap'] as const,
  paymentRequests: () => [...apKeys.all, 'payment-requests'] as const,
  paymentRequest: (id: PaymentRequestId) => [...apKeys.paymentRequests(), id] as const,
  vendorBills: () => [...apKeys.all, 'vendor-bills'] as const,
  vendorBill: (id: VendorBillId) => [...apKeys.vendorBills(), id] as const,
}
