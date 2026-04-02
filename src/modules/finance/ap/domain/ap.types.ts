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

export type PaymentRequestStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID'

export interface PaymentRequestLine {
  id: PaymentRequestLineId // Line IDs are now branded for full type purity
  description: string
  amount: Money
  accountId: AccountId | null
  categoryId: CategoryId | null
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
  paidAt: IsoDate | null
  currentApprovalStep: number
  assignedApproverId: UserId | null
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
  id?: VendorBillLineId
  description: string
  amount: Money
  accountId: AccountId | null
  categoryId: CategoryId | null
  journalLineId: JournalLineId | null
}

export interface VendorBill {
  id: VendorBillId
  vendorId: VendorId
  billNumber: string
  issueDate: IsoDate
  dueDate: IsoDate
  currency: Currency
  justification: string
  status: VendorBillStatus
  totalAmount: Money
  lines: VendorBillLine[]
}

export interface VendorBillCreate {
  vendorId: VendorId
  billNumber: string
  issueDate: IsoDate
  dueDate: IsoDate
  currency: Currency
  justification: string
  lines: (Omit<VendorBillLine, 'amount' | 'journalLineId'> & { amount: number })[]
}
