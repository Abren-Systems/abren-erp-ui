import { apiGet, apiPost } from '@/shared/api/http-client'
import type {
  WarehouseDTO,
  ItemDTO,
  StockLevelDTO,
  BatchDTO,
  SerialNumberDTO,
  CreateAdjustmentDTO,
  AdjustmentDTO,
} from './api.types'
import {
  WarehouseSchema,
  ItemSchema,
  StockLevelSchema,
  BatchSchema,
  SerialNumberSchema,
  AdjustmentSchema,
} from './api.schemas'

/**
 * Inventory API Adapter
 * Handles all HTTP interactions for the Inventory boundary.
 * Enforces runtime validation via Zod at the boundary.
 */
export const inventoryAdapter = {
  async getWarehouses(): Promise<WarehouseDTO[]> {
    const raw = await apiGet<unknown[]>('/inventory/warehouses')
    return raw.map((item) => WarehouseSchema.parse(item))
  },

  async getWarehouseById(id: string): Promise<WarehouseDTO> {
    const raw = await apiGet<unknown>(`/inventory/warehouses/${id}`)
    return WarehouseSchema.parse(raw)
  },

  async createWarehouse(dto: Partial<WarehouseDTO>): Promise<WarehouseDTO> {
    const raw = await apiPost<unknown>('/inventory/warehouses', dto)
    return WarehouseSchema.parse(raw)
  },

  async getItems(): Promise<ItemDTO[]> {
    const raw = await apiGet<unknown[]>('/inventory/items')
    return raw.map((item) => ItemSchema.parse(item))
  },

  async getStockByWarehouse(warehouseId: string): Promise<StockLevelDTO[]> {
    const raw = await apiGet<unknown[]>(`/inventory/warehouses/${warehouseId}/stock`)
    return raw.map((item) => StockLevelSchema.parse(item))
  },

  async getStockItemById(stockItemId: string): Promise<StockLevelDTO> {
    const raw = await apiGet<unknown>(`/inventory/stock/${stockItemId}`)
    return StockLevelSchema.parse(raw)
  },

  async getBatches(itemId: string): Promise<BatchDTO[]> {
    const raw = await apiGet<unknown[]>(`/inventory/items/${itemId}/batches`)
    return raw.map((item) => BatchSchema.parse(item))
  },

  async getSerials(itemId: string): Promise<SerialNumberDTO[]> {
    const raw = await apiGet<unknown[]>(`/inventory/items/${itemId}/serials`)
    return raw.map((item) => SerialNumberSchema.parse(item))
  },

  async postAdjustment(dto: CreateAdjustmentDTO): Promise<AdjustmentDTO> {
    const raw = await apiPost<unknown>('/inventory/adjustments', dto)
    return AdjustmentSchema.parse(raw) as unknown as AdjustmentDTO
  },

  async getAdjustmentById(id: string): Promise<AdjustmentDTO> {
    const raw = await apiGet<unknown>(`/inventory/adjustments/${id}`)
    return AdjustmentSchema.parse(raw) as unknown as AdjustmentDTO
  },

  async getAdjustments(): Promise<AdjustmentDTO[]> {
    const raw = await apiGet<unknown[]>('/inventory/adjustments')
    return raw.map((item) => AdjustmentSchema.parse(item) as unknown as AdjustmentDTO)
  },
}
