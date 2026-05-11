import type { Money, Currency } from '@/shared/domain/money'
import type { IsoDate } from '@/shared/domain/business-date'
import type {
  PaymentRequestId,
  PaymentRequestLineId,
  VendorBillId,
  VendorBillLineId,
  UserId,
  AccountId,
  CategoryId,
  VendorId,
  BankAccountId,
  JournalLineId,
} from '@/shared/types/brand.types'

// --- Payment Request Types ---

export type PaymentRequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'AUTHORIZED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'PAID'

export interface PaymentRequestLine {
  id: PaymentRequestLineId // Line IDs are now branded for full type purity
  description: string
  amount: Money
  accountId: AccountId | null
  categoryId: CategoryId | null
  lineType: 'GOODS' | 'SERVICE'
  taxAmount: Money | null
}

export interface PaymentRequest {
  id: PaymentRequestId
  requesterId: UserId
  beneficiaryId: UserId
  totalAmount: Money
  currency: Currency
  justification: string
  status: PaymentRequestStatus
  lines: PaymentRequestLine[]
  bankAccountId: BankAccountId | null
  targetLiabilityAccountId: AccountId | null
  submittedAt: IsoDate | null
  authorizedAt: IsoDate | null
  authorizedBy: UserId | null
  currentApprovalStep: number
  assignedApproverId: UserId | null
  sourceModule: string | null
  sourceId: string | null
  requestNumber: string
}

// --- Vendor Bill Types ---

export type VendorBillStatus = 'DRAFT' | 'VALIDATED' | 'PAID' | 'VOIDED'

export interface VendorBillLine {
  id?: VendorBillLineId | undefined
  description: string
  amount: Money
  accountId: AccountId | null
  categoryId: CategoryId | null
  lineType: 'GOODS' | 'SERVICE'
  journalLineId: JournalLineId | null
  whtAmount: Money | null
}

export interface VendorBill {
  id: VendorBillId
  vendorId: VendorId
  billNumber: string
  vendorInvoiceNumber: string
  issueDate: IsoDate
  dueDate: IsoDate
  currency: Currency
  justification: string
  status: VendorBillStatus
  totalAmount: Money
  whtTotal: Money
  netPayable: Money
  totalPaid: Money
  totalWithheld: Money
  lines: VendorBillLine[]
}

export interface CreateVendorBillDTO {
  vendorId: VendorId
  billNumber: string
  vendorInvoiceNumber: string
  issueDate: IsoDate
  dueDate: IsoDate
  currency: Currency
  justification: string
  lines: (Omit<VendorBillLine, 'amount' | 'journalLineId'> & {
    amount: number
  })[]
}

export interface PaymentRequestStats {
  tenantId: string
  totalCount: number
  draftCount: number
  submittedCount: number
  approvedCount: number
  rejectedCount: number
  authorizedCount: number
  cancelledCount: number
  totalAmount: Money
}
