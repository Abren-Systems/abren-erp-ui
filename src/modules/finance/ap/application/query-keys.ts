/**
 * Query Key Factory for Accounts Payable Module
 *
 * Centralized source of truth for TanStack Query keys.
 */
import type { PaymentRequestId, VendorBillId } from '@/shared/types/brand.types'

export const apKeys = {
  all: ['ap'] as const,
  paymentRequests: (query?: unknown) => [...apKeys.all, 'payment-requests', query] as const,
  paymentRequest: (id: PaymentRequestId) =>
    [...apKeys.all, 'payment-requests', 'detail', id] as const,
  vendorBills: (query?: unknown) => [...apKeys.all, 'vendor-bills', query] as const,
  vendorBill: (id: VendorBillId) => [...apKeys.all, 'vendor-bills', 'detail', id] as const,
}
