import { z } from 'zod'

export const ARDocumentStatus = z.enum([
  'Hold',
  'Balanced',
  'Voided',
  'Scheduled',
  'Open',
  'Closed',
  'Released',
])

export type ARDocumentStatus = z.infer<typeof ARDocumentStatus>

export const ARInvoiceLineSchema = z.object({
  id: z.string().uuid(),
  branchId: z.string(),
  inventoryId: z.string().optional(),
  description: z.string(),
  quantity: z.number(),
  uom: z.string(),
  unitPrice: z.number(),
  amount: z.number(),
  accountId: z.string(),
  subaccountId: z.string(),
})

export const ARInvoiceSchema = z.object({
  id: z.string().uuid(),
  docType: z.enum(['INV', 'CRM', 'DRM', 'PMT']),
  docNumber: z.string(),
  status: ARDocumentStatus,
  date: z.string(), // ISO date
  postPeriod: z.string(),
  customerId: z.string(),
  customerLocationId: z.string(),
  currencyId: z.string(),
  description: z.string().optional(),
  docAmount: z.number(),
  balance: z.number(),
  lines: z.array(ARInvoiceLineSchema),
  availableActions: z.array(z.string()).default([]),
})

export type ARInvoice = z.infer<typeof ARInvoiceSchema>
export type ARInvoiceLine = z.infer<typeof ARInvoiceLineSchema>
