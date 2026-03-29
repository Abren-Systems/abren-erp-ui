import type { Money } from '@/core/domain/money'

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
  id: string
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
