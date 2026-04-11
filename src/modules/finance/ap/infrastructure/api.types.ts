import type { components } from '@/shared/api/generated.types'

/** Consolidated AP Domain DTOs (Strictly aligned to backend Pydantic models via OpenAPI) */

export type Schemas = components['schemas']

// --- Payment Request DTOs ---

export type PaymentRequestStatusDTO = any // Schemas['PaymentRequestStatus']
export type PaymentRequestLineDTO = any // Schemas['PaymentRequestLineDTO']
export type PaymentRequestDTO = Schemas['PaymentRequestResponse']
export type PaymentRequestLineCreateDTO = any // Schemas['PaymentRequestLineCreateDTO']
export type PaymentRequestCreateDTO = Schemas['PaymentRequestCreateRequest']
export type PaymentRequestPayDTO = Schemas['PaymentRequestPayRequest']
export type PaymentRequestRejectDTO = Schemas['PaymentRequestRejectRequest']
export type PaymentRequestStatsDTO = Schemas['PaymentRequestStatsResponse']

// --- Vendor Bill DTOs ---

export type VendorBillLineDTO = Schemas['VendorBillLineDTO']
export type VendorBillDTO = Schemas['VendorBillDTO']
export type VendorBillCreateDTO = Schemas['VendorBillCreateDTO']
export type VendorBillLineCreateDTO = Schemas['VendorBillLineCreateDTO']
