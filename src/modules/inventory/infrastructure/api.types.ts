/**
 * Inventory Module API DTOs
 * Synchronized with backend via OpenAPI generated types
 */
import type { components } from '@/shared/api/generated.types'

type Schemas = components['schemas']

export type WarehouseDTO = Schemas['WarehouseSchema']

// TrackingMode is a string enum from backend
export type TrackingMode = 'NONE' | 'BATCH' | 'SERIAL'

export type ItemDTO = Schemas['ItemSchema']

export type StockLevelDTO = Schemas['StockLevelSchema']

export type BatchDTO = Schemas['BatchSchema']

export type SerialNumberDTO = Schemas['SerialNumberSchema']

export type AdjustmentLineDTO = Schemas['AdjustmentLineSchema']

export type AdjustmentCreateDTO = Schemas['AdjustmentCreateSchema']

export type AdjustmentDTO = Schemas['AdjustmentSchema']
