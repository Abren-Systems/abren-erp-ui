import { z } from 'zod'

/**
 * DailyCashflowSchema — Architectural shielding for reporting data.
 *
 * Ensures all financial metrics received from the API are present
 * and correctly typed as strings to maintain decimal precision.
 */
export const DailyCashflowSchema = z.object({
  date: z.string(),
  inflow: z.string(),
  outflow: z.string(),
  net_change: z.string(),
  running_balance: z.string(),
})
