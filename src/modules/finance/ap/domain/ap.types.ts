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

import type { components } from '@/shared/api/generated.types'

// --- Payment Request Types ---

export type PaymentRequestStatus = components['schemas']['PaymentRequestStatus']

export const PaymentRequestStatus = {
  isFinal: (status: PaymentRequestStatus): boolean => status === 'PAID' || status === 'REJECTED',

  isApproved: (status: PaymentRequestStatus): boolean => status === 'APPROVED' || status === 'PAID',

  isEditable: (status: PaymentRequestStatus): boolean => status === 'DRAFT',

  canTransitionTo: (current: PaymentRequestStatus, target: PaymentRequestStatus): boolean => {
    if (current === target) return true
    if (PaymentRequestStatus.isFinal(current)) return false

    const transitions: Record<PaymentRequestStatus, PaymentRequestStatus[]> = {
      DRAFT: ['SUBMITTED'],
      SUBMITTED: ['APPROVED', 'REJECTED'],
      APPROVED: ['PAID', 'REJECTED'],
      REJECTED: [],
      PAID: [],
    }

    return transitions[current].includes(target)
  },
} as const

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

export type VendorBillStatus = components['schemas']['VendorBillStatus']

export const VendorBillStatus = {
  isPaid: (status: VendorBillStatus): boolean => status === 'PAID',
  isValidated: (status: VendorBillStatus): boolean => status === 'VALIDATED' || status === 'PAID',
} as const

export interface VendorBillLine {
  id?: VendorBillLineId | undefined
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
  paidCount: number
  totalAmount: Money
}
