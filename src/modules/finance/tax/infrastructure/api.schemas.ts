import { z } from 'zod'

export const TaxRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  rate: z.union([z.number(), z.string()]), // APIs often return Decimals as strings or numbers
  tax_type: z.enum(['VAT', 'WHT']),
  gl_account_id: z.string().uuid(),
  is_active: z.boolean(),
})

export const TaxCalculationResponseSchema = z.object({
  net: z.union([z.number(), z.string()]),
  tax: z.union([z.number(), z.string()]),
  gross: z.union([z.number(), z.string()]),
  currency: z.string(),
})
