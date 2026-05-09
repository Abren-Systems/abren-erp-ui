/**
 * Inventory Module API DTOs
 * Synchronized with backend via OpenAPI generated types
 */
import type { components } from '@/shared/api/generated.types'

type Schemas = components['schemas']

export type WarehouseDTO = Schemas['WarehouseDTO']

// TrackingMode is a string enum from backend
export type TrackingMode = 'NONE' | 'BATCH' | 'SERIAL'

export type ItemDTO = Schemas['ItemDTO']

export type StockLevelDTO = Schemas['StockLevelDTO']

export type BatchDTO = Schemas['BatchDTO']

export type SerialNumberDTO = Schemas['SerialNumberDTO']

export type AdjustmentLineDTO = Schemas['CreateAdjustmentLineDTO']

export type CreateAdjustmentDTO = Schemas['CreateAdjustmentDTO']

export type AdjustmentDTO = {
  id: string
  warehouse_id: string
  reason: string
  lines: AdjustmentLineDTO[]
}
