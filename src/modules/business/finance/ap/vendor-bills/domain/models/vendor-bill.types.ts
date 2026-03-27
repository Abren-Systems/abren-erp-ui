export enum VendorBillStatus {
  DRAFT = 'DRAFT',
  VALIDATED = 'VALIDATED',
  PAID = 'PAID',
}

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
