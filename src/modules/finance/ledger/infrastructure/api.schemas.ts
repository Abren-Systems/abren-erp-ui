import { z } from 'zod'

/**
 * JournalLineSchema — Architectural shielding for Individual Journal Entry lines.
 */
export const JournalLineSchema = z.object({
  id: z.string().uuid(),
  account_id: z.string().uuid(),
  party_id: z.string().uuid().nullable(),
  party_type: z.string().nullable(),
  document_id: z.string().uuid().nullable(),
  description: z.string().nullable(),
  amount: z.string(),
  currency_code: z.string(),
  amount_in_base: z.string(),
  original_amount: z.string(),
  original_currency: z.string(),
  base_amount: z.string(),
  exchange_rate: z.string(),
  exchange_rate_source: z.string().nullable(),
  exchange_rate_ref: z.string().nullable(),
  exchange_rate_date: z.string().nullable(),
  fx_gain_loss: z.string().nullable(),
  intercompany_tenant_id: z.string().nullable(),
  is_debit: z.boolean(),
})

/**
 * JournalEntrySchema — Architectural shielding for General Ledger transactions.
 */
export const JournalEntrySchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  entry_number: z.string(),
  date: z.string(),
  description: z.string(),
  base_currency_code: z.string(),
  status: z.string(),
  lines: z.array(JournalLineSchema),
  posted_by: z.string().nullable(),
  posted_at: z.string().nullable(),
  created_at: z.string().nullable(),
})

/**
 * AccountSchema — Architectural shielding for the Chart of Accounts (COA).
 */
export const AccountSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  code: z.number(),
  name: z.string(),
  account_type: z.string(),
  parent_id: z.string().uuid().nullable(),
  currency_code: z.string().nullable(),
  requires_revaluation: z.boolean().default(false),
  is_active: z.boolean(),
})

/**
 * FiscalPeriodSchema — Architectural shielding for financial reporting periods.
 */
export const FiscalPeriodSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  status: z.string(),
  created_at: z.string().nullable(),
})

/**
 * LedgerSettingsSchema — Architectural shielding for ledger global configuration.
 */
export const LedgerSettingsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  default_bridge_account_id: z.string().uuid().nullable(),
  pr_payable_account_id: z.string().uuid().nullable(),
  ap_payable_account_id: z.string().uuid().nullable(),
  bank_account_id: z.string().uuid().nullable(),
  vat_input_account_id: z.string().uuid().nullable(),
  wht_payable_account_id: z.string().uuid().nullable(),
})
