import type { Money } from '@/shared/domain/money'
import type { PaymentRequestId, VendorBillId } from '@/shared/types/brand.types'

// --- Payment Request Types ---

export type PaymentRequestStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID'

export interface PaymentRequestLine {
  id: string
  description: string
  amount: Money
  accountId: string | null
  categoryId: string | null
  taxAmount: Money | null
}

export interface PaymentRequest {
  id: PaymentRequestId
  requesterId: string
  beneficiaryId: string
  totalAmount: Money
  currency: string
  justification: string
  status: PaymentRequestStatus
  lines: PaymentRequestLine[]
  bankAccountId: string | null
  targetLiabilityAccountId: string | null
  submittedAt: Date | null
  paidAt: Date | null
  currentApprovalStep: number
  assignedApproverId: string | null
  sourceModule: string | null
  sourceId: string | null
}

// --- Vendor Bill Types ---

export enum VendorBillStatus {
  DRAFT = 'DRAFT',
  VALIDATED = 'VALIDATED',
  PAID = 'PAID',
}

export interface VendorBillLine {
  id?: string
  description: string
  amount: Money
  accountId: string | null
  categoryId: string | null
  journalLineId: string | null
}

export interface VendorBill {
  id: VendorBillId
  vendorId: string
  billNumber: string
  issueDate: Date
  dueDate: Date
  currency: string
  justification: string
  status: VendorBillStatus
  totalAmount: Money
  lines: VendorBillLine[]
}

export interface VendorBillCreate {
  vendorId: string
  billNumber: string
  issueDate: string
  dueDate: string
  currency: string
  justification: string
  lines: Omit<VendorBillLine, 'amount' | 'journalLineId'> & { amount: number }[]
}
