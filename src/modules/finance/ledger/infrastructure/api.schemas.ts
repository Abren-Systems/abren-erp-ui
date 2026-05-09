import { z } from 'zod'

/**
 * General Ledger (GL) API Schemas.
 * Used for runtime validation of API responses to ensure domain integrity.
 */

export const JournalLineSchema = z.object({
  id: z.string().uuid(),
  account_id: z.string().uuid(),
  party_id: z.string().uuid().nullable(),
  party_type: z.string().nullable(),
  document_id: z.string().uuid().nullable(),
  description: z.string().nullable(),
  amount: z.coerce.string(),
  currency_code: z.string(),
  amount_in_base: z.coerce.string(),
  original_amount: z.coerce.string(),
  original_currency: z.string(),
  base_amount: z.coerce.string(),
  exchange_rate: z.coerce.string(),
  exchange_rate_source: z.string().nullable(),
  exchange_rate_ref: z.string().nullable(),
  exchange_rate_date: z.string().nullable(),
  is_debit: z.boolean(),
  fx_gain_loss: z.coerce.string().nullable(),
  intercompany_tenant_id: z.string().uuid().nullable(),
})

export const JournalEntrySchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  entry_number: z.string(),
  date: z.string(),
  description: z.string(),
  base_currency_code: z.string(),
  status: z.string(),
  lines: z.array(JournalLineSchema),
  posted_by: z.string().uuid().nullable(),
  posted_at: z.string().nullable(),
  created_at: z.string().nullable(),
})

export const AccountSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
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
  tenant_id: z.string().uuid(),
  fiscal_year_id: z.string().uuid(),
  name: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  status: z.string(),
  created_at: z.string().nullable(),
})

export const FiscalYearSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  year: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  periods: z.array(FiscalPeriodSchema),
  created_at: z.string().nullable(),
})

/**
 * LedgerSettingsSchema — Architectural shielding for ledger global configuration.
 */
export const LedgerSettingsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  default_bridge_account_id: z.string().uuid().nullable(),
  retained_earnings_account_id: z.string().uuid().nullable(),
  pr_payable_account_id: z.string().uuid().nullable(),
  ap_payable_account_id: z.string().uuid().nullable(),
  bank_account_id: z.string().uuid().nullable(),
  vat_input_account_id: z.string().uuid().nullable(),
  wht_payable_account_id: z.string().uuid().nullable(),
  is_multicurrency: z.boolean(),
  base_currency_code: z.string(),
})
