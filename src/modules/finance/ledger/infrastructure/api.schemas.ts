import { z } from 'zod'

/**
 * JournalLineSchema — Architectural shielding for Individual Journal Entry lines.
 */
export const JournalLineSchema = z.object({
  id: z.string().uuid(),
  account_id: z.string().uuid(),
  description: z.string().nullable().optional(),
  amount: z.string(),
  currency: z.string(),
  amount_in_base: z.string(),
  // FX Audit Trail (Hardened)
  original_amount: z.string(),
  original_currency: z.string(),
  base_amount: z.string(),
  exchange_rate: z.string(),
  is_debit: z.boolean(),
})

/**
 * JournalEntrySchema — Architectural shielding for General Ledger transactions.
 */
export const JournalEntrySchema = z.object({
  id: z.string().uuid(),
  entry_number: z.string(),
  date: z.string(),
  description: z.string(),
  base_currency: z.string(),
  status: z.string(),
  lines: z.array(JournalLineSchema),
  created_at: z.string().optional(),
})

/**
 * AccountSchema — Architectural shielding for the Chart of Accounts (COA).
 */
export const AccountSchema = z.object({
  id: z.string().uuid(),
  code: z.number(),
  name: z.string(),
  account_type: z.string(),
  parent_id: z.string().nullable().optional(),
  currency_code: z.string().nullable().optional(),
  requires_revaluation: z.boolean().default(false),
  is_active: z.boolean(),
})

/**
 * FiscalPeriodSchema — Architectural shielding for financial reporting periods.
 */
export const FiscalPeriodSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  status: z.string(),
})

/**
 * LedgerSettingsSchema — Architectural shielding for ledger global configuration.
 */
export const LedgerSettingsSchema = z.object({
  default_bridge_account_id: z.string().uuid().nullable().optional(),
  pr_payable_account_id: z.string().uuid().nullable().optional(),
})
