import { z } from 'zod'

/**
 * DailyCashflowSchema — Architectural shielding for reporting data.
 *
 * Ensures all financial metrics received from the API are present
 * and correctly typed as strings to maintain decimal precision.
 */
export const DailyCashflowSchema = z.object({
  date: z.string(),
  total_inflow: z.string(),
  total_outflow: z.string(),
  projected_inflow: z.string(),
  projected_outflow: z.string(),
  net_cashflow: z.string(),
  currency_code: z.string(),
})
