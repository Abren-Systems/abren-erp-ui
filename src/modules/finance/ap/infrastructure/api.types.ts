import type { z } from 'zod'
import type {
  PaymentRequestLineSchema,
  PaymentRequestSchema,
  PaymentRequestStatsSchema,
  VendorBillLineSchema,
  VendorBillSchema,
  VendorSchema,
} from './api.schemas'

/** Consolidated AP Domain DTOs (Strictly aligned to backend Pydantic models via Zod schemas) */

// --- Payment Request DTOs ---

export type PaymentRequestStatus = string
export type PaymentRequestStatusDTO = PaymentRequestStatus
export type PaymentRequestLineDTO = z.infer<typeof PaymentRequestLineSchema>
export type PaymentRequestDTO = z.infer<typeof PaymentRequestSchema>
export interface CreatePaymentRequestLineDTO {
  description: string
  amount: string
  account_id?: string | null
  category_id?: string | null
  line_type: 'GOODS' | 'SERVICE'
  tax_amount?: string | null
}
export interface CreatePaymentRequestDTO {
  beneficiary_id: string
  justification: string
  lines: CreatePaymentRequestLineDTO[]
  currency: string
  bank_account_id?: string | null
  target_liability_account_id?: string | null
}
export type AuthorizePaymentRequestDTO = void
export interface RejectPaymentRequestDTO {
  reason: string
}
export type PaymentRequestStatsDTO = z.infer<typeof PaymentRequestStatsSchema>

// --- Vendor Bill DTOs ---

export type VendorBillLineDTO = z.infer<typeof VendorBillLineSchema>
export type VendorBillStatus = string
export type VendorBillDTO = z.infer<typeof VendorBillSchema>
export interface CreateVendorBillLineDTO {
  description: string
  amount: number
  line_type: 'GOODS' | 'SERVICE'
  account_id?: string | null
  category_id?: string | null
  tax_rule_id?: string | null
}
export interface CreateVendorBillDTO {
  vendor_id: string
  vendor_invoice_number: string
  issue_date: string
  due_date?: string | null
  currency: string
  justification: string
  lines: CreateVendorBillLineDTO[]
}

export interface CreateVendorDTO {
  name: string
  tin?: string | null
  trade_license_number?: string | null
  has_tin_certificate: boolean
  has_valid_trade_license: boolean
}

export type VendorDTO = z.infer<typeof VendorSchema>
