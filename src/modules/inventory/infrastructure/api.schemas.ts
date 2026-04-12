import { z } from 'zod'

/**
 * Inventory Module API Schemas
 * Runtime validation for incoming API payloads
 */

export const WarehouseSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string(),
  code: z.string(),
  is_active: z.boolean(),
  is_quarantine: z.boolean(),
})

export const ItemSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  product_id: z.string().uuid(),
  sku: z.string(),
  name: z.string(),
  tracking_mode: z.string(),
})

export const StockLevelSchema = z.object({
  stock_item_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  item_id: z.string().uuid(),
  warehouse_id: z.string().uuid(),
  quantity: z.string(),
  weighted_average_cost: z.string(),
  total_value: z.string(),
})

export const BatchSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  batch_number: z.string(),
  item_id: z.string().uuid(),
  production_date: z.string().nullable().optional(),
  expiry_date: z.string().nullable().optional(),
})

export const SerialNumberSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  serial_number: z.string(),
  item_id: z.string().uuid(),
  is_available: z.boolean(),
})

export const AdjustmentLineSchema = z.object({
  stock_item_id: z.string().uuid(),
  quantity_delta: z.union([z.number(), z.string()]),
  reason: z.string().nullable().optional(),
  batch_number: z.string().nullable().optional(),
  serial_ids: z.array(z.string().uuid()).nullable().optional(),
})

export const AdjustmentCreateSchema = z.object({
  warehouse_id: z.string().uuid(),
  reason: z.string(),
  lines: z.array(AdjustmentLineSchema),
})

export const AdjustmentSchema = z.object({
  id: z.string().uuid(),
})
