import { z } from 'zod'

/**
 * BankAccountSchema — Architectural shielding for bank account data.
 */
export const BankAccountSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string(),
  account_number: z.string(),
  bank_name: z.string(),
  account_type: z.string(),
  currency_code: z.string(),
  current_balance: z.string(),
  bank_code: z.string().nullable().optional(),
  branch_name: z.string().nullable().optional(),
  ledger_account_id: z.string().nullable().optional(),
  is_active: z.boolean(),
  is_default: z.boolean(),
})

/**
 * BankTransactionSchema — Architectural shielding for bank transaction history.
 */
export const BankTransactionSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  bank_account_id: z.string().uuid(),
  transaction_date: z.string(),
  value_date: z.string().nullable(),
  description: z.string(),
  reference: z.string().nullable(),
  amount: z.string(),
  currency_code: z.string(),
  transaction_type: z.string(),
  reconciliation_status: z.string(),
  reconciled_at: z.string().nullable(),
  reconciled_by: z.string().nullable(),
  journal_entry_id: z.string().nullable(),
  journal_line_id: z.string().nullable(),
  source: z.string(),
})

/**
 * ScheduledPaymentSchema — Architectural shielding for future bank obligations.
 */
export const ScheduledPaymentSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  bank_account_id: z.string().uuid(),
  category: z.string(),
  description: z.string(),
  amount: z.string(),
  currency_code: z.string(),
  due_date: z.string(),
  status: z.string(),
  source_module: z.string().nullable().optional(),
  source_id: z.string().nullable().optional(),
})
