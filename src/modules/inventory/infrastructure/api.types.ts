/**
 * Inventory Module API DTOs
 * Manually defined as the OpenAPI sync is pending.
 */

export interface WarehouseDTO {
  id: string
  tenant_id: string
  name: string
  code: string
  is_active: boolean
  is_quarantine: boolean
}

export type TrackingMode = 'NONE' | 'BATCH' | 'SERIAL'

export interface ItemDTO {
  id: string
  tenant_id: string
  product_id: string
  sku: string
  name: string
  tracking_mode: TrackingMode
}

export interface StockItemDTO {
  id: string
  tenant_id: string
  warehouse_id: string
  item_id: string
  quantity: number
  total_value: number
  batch_id?: string | null
  serial_id?: string | null
}

export interface BatchDTO {
  id: string
  tenant_id: string
  item_id: string
  batch_number: string
  production_date?: string | null
  expiry_date?: string | null
}

export interface SerialNumberDTO {
  id: string
  tenant_id: string
  item_id: string
  serial_number: string
  current_stock_item_id?: string | null
  is_available: boolean
}

export interface AdjustmentLineDTO {
  stock_item_id: string
  quantity_delta: number
  valuation_strategy: 'AUTO' | 'MANUAL'
  manual_unit_cost?: number | null
  batch_number?: string | null
  production_date?: string | null
  expiry_date?: string | null
}

export interface AdjustmentCreateDTO {
  warehouse_id: string
  reason: string
  lines: AdjustmentLineDTO[]
}

export interface AdjustmentDTO {
  id: string
  warehouse_id: string
  reason: string
  status: string
}
