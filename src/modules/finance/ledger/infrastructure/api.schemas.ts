import { z } from 'zod'

/**
 * JournalLineSchema — Architectural shielding for Individual Journal Entry lines.
 */
export const JournalLineSchema = z.object({
  id: z.string().uuid(),
  account_id: z.string().uuid(),
  description: z.string().nullable(),
  amount: z.string(),
  currency: z.string(),
  amount_in_base: z.string(),
  original_amount: z.string(),
  original_currency: z.string(),
  base_amount: z.string(),
  exchange_rate: z.string(),
  intercompany_tenant_id: z.string().uuid().nullable().optional(),
  party_id: z.string().uuid().nullable().optional(),
  party_type: z.string().nullable().optional(),
  is_debit: z.boolean(),
})

export const JournalEntrySchema = z.object({
  id: z.string().uuid(),
  entry_number: z.string(),
  date: z.string(),
  description: z.string(),
  base_currency: z.string(),
  status: z.string(),
  lines: z.array(JournalLineSchema),
  created_at: z.string().nullable(),
})

export const AccountSchema = z.object({
  id: z.string().uuid(),
  code: z.number(),
  name: z.string(),
  account_type: z.string(),
  parent_id: z.string().uuid().nullable(),
  currency_code: z.string().nullable(),
  requires_revaluation: z.boolean(),
  is_active: z.boolean(),
})

export const FiscalPeriodSchema = z.object({
  id: z.string().uuid(),
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
