import { z } from 'zod'
import {
  createPaginatedResponseSchema,
  createOperationalResponseSchema,
} from '@/shared/infrastructure/api.schemas'

/**
 * Zod Schemas for Accounts Payable (AP) Module.
 * These serve as the "Fail-Fast Shield" at the infrastructure boundary.
 */

export const PaymentRequestStatusSchema = z.enum([
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'AUTHORIZED',
  'REJECTED',
  'CANCELLED',
])

export const PaymentRequestLineSchema = z.object({
  id: z.string().uuid(),
  description: z.string().min(1),
  amount: z.coerce.string(), // Resilient to number vs string Decimal types
  account_id: z.string().uuid().nullable(),
  category_id: z.string().uuid().nullable(),
  line_type: z.enum(['GOODS', 'SERVICE']).default('GOODS'),
  tax_amount: z.coerce.string().nullable(),
})

export const PaymentRequestSchema = z.object({
  id: z.string().uuid(),
  requester_id: z.string().uuid(),
  beneficiary_id: z.string().uuid(),
  total_amount: z.coerce.string(), // Resilient to number vs string Decimal types
  currency: z.string().length(3),
  justification: z.string(),
  status: PaymentRequestStatusSchema,
  lines: z.array(PaymentRequestLineSchema),
  bank_account_id: z.string().uuid().nullable().optional(),
  target_liability_account_id: z.string().uuid().nullable().optional(),
  submitted_at: z.string().nullable().optional(), // Loosen datetime validation to avoid hard crashes
  authorized_at: z.string().nullable().optional(),
  authorized_by: z.string().uuid().nullable().optional(),
  current_approval_step: z.number().int().nonnegative().nullable().optional(),
  assigned_approver_id: z.string().uuid().nullable().optional(),
  source_module: z.string().nullable().optional(),
  source_id: z.string().uuid().nullable().optional(),
  request_number: z.string().nullable().optional(),
})

/**
 * Shallow schema for Grid/List views.
 * Omit lines and heavy relations to minimize memory footprint.
 */
export const PaymentRequestListItemSchema = PaymentRequestSchema.omit({
  lines: true,
})

export const PaymentRequestStatsSchema = z.object({
  tenant_id: z.string().uuid(),
  total_count: z.number().int(),
  draft_count: z.number().int(),
  submitted_count: z.number().int(),
  approved_count: z.number().int(),
  rejected_count: z.number().int(),
  authorized_count: z.number().int(),
  cancelled_count: z.number().int().optional().default(0),
  total_amount: z.coerce.string(),
})

export const VendorBillLineSchema = z.object({
  id: z.string().uuid(), // Mandatory in DTO
  description: z.string(),
  amount: z.coerce.string(),
  tax_rule_id: z.string().uuid().nullable(),
  tax_amount: z.coerce.string().nullable(),
  line_type: z.enum(['GOODS', 'SERVICE']).default('GOODS'),
  account_id: z.string().uuid().nullable(),
  category_id: z.string().uuid().nullable(),
  journal_line_id: z.string().uuid().nullable(),
  wht_amount: z.coerce.string().nullable(),
})

export const VendorBillSchema = z.object({
  id: z.string().uuid(),
  vendor_id: z.string().uuid(),
  document_number: z.string().nullable().optional(), // Internal system number
  vendor_invoice_number: z.string(), // External vendor invoice number
  issue_date: z.string(), // ISO Date string
  due_date: z.string().nullable().optional(), // ISO Date string
  currency: z.string().length(3),
  justification: z.string(), // Mandatory in DTO
  status: z.enum(['DRAFT', 'VALIDATED', 'PAID', 'CANCELLED']),
  net: z.coerce.string(),
  tax_total: z.coerce.string(),
  wht_total: z.coerce.string().default('0'),
  total_amount: z.coerce.string(),
  net_payable: z.coerce.string().default('0'),
  total_paid: z.coerce.string().default('0'),
  total_withheld: z.coerce.string().default('0'),
  lines: z.array(VendorBillLineSchema),
})

/**
 * Shallow schema for Grid/List views.
 */
export const VendorBillListItemSchema = VendorBillSchema.omit({
  lines: true,
})

export const OperationalPaymentRequestSchema = createOperationalResponseSchema(PaymentRequestSchema)
export const OperationalVendorBillSchema = createOperationalResponseSchema(VendorBillSchema)

export const PaymentRequestListSchema = createPaginatedResponseSchema(
  createOperationalResponseSchema(PaymentRequestListItemSchema),
)
export const VendorBillListSchema = createPaginatedResponseSchema(
  createOperationalResponseSchema(VendorBillListItemSchema),
)
