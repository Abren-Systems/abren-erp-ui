import type { components } from '@/shared/api/generated.types'

/** Consolidated AP Domain DTOs (Strictly aligned to backend Pydantic models via OpenAPI) */

export type Schemas = components['schemas']

// --- Payment Request DTOs ---

export type PaymentRequestStatusDTO = unknown // Schemas['PaymentRequestStatus']
export type PaymentRequestLineDTO = Schemas['PaymentRequestLineSchema']
export type PaymentRequestDTO = Schemas['PaymentRequestResponse']
export type PaymentRequestLineCreateDTO = unknown // Schemas['PaymentRequestLineCreateDTO']
export type PaymentRequestCreateDTO = Schemas['PaymentRequestCreateRequest']
export type PaymentRequestPayDTO = Schemas['PaymentRequestPayRequest']
export type PaymentRequestRejectDTO = Schemas['PaymentRequestRejectRequest']
export type PaymentRequestStatsDTO = Schemas['PaymentRequestStatsResponse']

// --- Vendor Bill DTOs ---

export type VendorBillLineDTO = Schemas['VendorBillLineSchema']
export type VendorBillDTO = Schemas['VendorBillResponse']
export type VendorBillCreateDTO = Schemas['VendorBillCreateRequest']
export type VendorBillLineCreateDTO = Schemas['VendorBillLineRequest']
