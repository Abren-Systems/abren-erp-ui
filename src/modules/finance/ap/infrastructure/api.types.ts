import type { VendorBillStatus } from '../domain/ap.types'

/** Consolidated AP Domain DTOs (Aligned to backend Pydantic models) */

// --- Payment Request DTOs ---

export type PaymentRequestStatusDTO = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID'

export interface PaymentRequestLineDTO {
  id: string
  description: string
  amount: number
  account_id: string | null
  category_id: string | null
  tax_amount: number | null
}

export interface PaymentRequestDTO {
  id: string
  requester_id: string
  beneficiary_id: string
  total_amount: number
  currency: string
  justification: string
  status: PaymentRequestStatusDTO
  lines: PaymentRequestLineDTO[]
  bank_account_id: string | null
  target_liability_account_id: string | null
  submitted_at: string | null
  paid_at: string | null
  current_approval_step: number
  assigned_approver_id: string | null
  source_module: string | null
  source_id: string | null
}

export interface PaymentRequestLineCreateDTO {
  description: string
  amount: number
  account_id?: string | null
  category_id?: string | null
  tax_amount?: number | null
}

export interface PaymentRequestCreateDTO {
  beneficiary_id: string
  currency: string
  justification: string
  lines: PaymentRequestLineCreateDTO[]
  bank_account_id?: string | null
  target_liability_account_id?: string | null
  source_module?: string | null
  source_id?: string | null
}

export interface PaymentRequestPayDTO {
  payment_method: string
  disbursement_reference: string
}

export interface PaymentRequestRejectDTO {
  reason: string
}

// --- Vendor Bill DTOs ---

export interface VendorBillLineDTO {
  id?: string
  description: string
  amount: number
  account_id?: string | null
  category_id?: string | null
  journal_line_id?: string | null
}

export interface VendorBillDTO {
  id: string
  vendor_id: string
  bill_number: string
  issue_date: string
  due_date: string
  currency: string
  justification: string
  status: VendorBillStatus
  total_amount: number
  lines: VendorBillLineDTO[]
}

export interface VendorBillCreateDTO {
  vendor_id: string
  bill_number: string
  issue_date: string
  due_date: string
  currency: string
  justification: string
  lines: VendorBillLineDTO[]
}
