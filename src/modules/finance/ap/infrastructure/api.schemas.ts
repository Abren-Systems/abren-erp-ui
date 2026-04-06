import { z } from 'zod'

/**
 * Zod Schemas for Accounts Payable (AP) Module.
 * These serve as the "Fail-Fast Shield" at the infrastructure boundary.
 */

export const PaymentRequestStatusSchema = z.enum([
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
  'PAID',
])

export const PaymentRequestLineSchema = z.object({
  id: z.string().uuid(),
  description: z.string().min(1),
  amount: z.string(), // Synchronized with OpenAPI Decimal (string)
  account_id: z.string().uuid().nullable(),
  category_id: z.string().uuid().nullable(),
  tax_amount: z.string().nullable(),
})

export const PaymentRequestSchema = z.object({
  id: z.string().uuid(),
  requester_id: z.string().uuid(),
  beneficiary_id: z.string().uuid(),
  total_amount: z.string(),
  currency: z.string().length(3),
  justification: z.string(),
  status: PaymentRequestStatusSchema,
  lines: z.array(PaymentRequestLineSchema),
  bank_account_id: z.string().uuid().nullable(),
  target_liability_account_id: z.string().uuid().nullable(),
  submitted_at: z.string().datetime().nullable(),
  paid_at: z.string().datetime().nullable(),
  current_approval_step: z.number().int().nonnegative(),
  assigned_approver_id: z.string().uuid().nullable(),
})

export const PaymentRequestStatsSchema = z.object({
  total_count: z.number().int(),
  draft_count: z.number().int(),
  submitted_count: z.number().int(),
  approved_count: z.number().int(),
  rejected_count: z.number().int(),
  paid_count: z.number().int(),
  total_amount: z.string(),
})

export const VendorBillLineSchema = z.object({
  id: z.string().uuid(), // Mandatory in DTO
  description: z.string(),
  amount: z.string(),
  tax_rule_id: z.string().uuid().nullable(),
  tax_amount: z.string().nullable(),
  account_id: z.string().uuid().nullable(),
  category_id: z.string().uuid().nullable(),
  journal_line_id: z.string().uuid().nullable(),
})

export const VendorBillSchema = z.object({
  id: z.string().uuid(),
  vendor_id: z.string().uuid(),
  bill_number: z.string(),
  issue_date: z.string(), // ISO Date string
  due_date: z.string(), // ISO Date string
  currency: z.string().length(3),
  justification: z.string(), // Mandatory in DTO
  status: z.string(),
  net_amount: z.string(),
  tax_total: z.string(),
  total_amount: z.string(),
  lines: z.array(VendorBillLineSchema),
})
