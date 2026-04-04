import { apiGet, apiPost } from '@/shared/api/http-client'
import type {
  WarehouseDTO,
  ItemDTO,
  StockItemDTO,
  BatchDTO,
  SerialNumberDTO,
  AdjustmentCreateDTO,
  AdjustmentDTO,
} from './api.types'

/**
 * Inventory API Adapter
 * Handles all HTTP interactions for the Inventory boundary.
 */
export const inventoryAdapter = {
  async getWarehouses(): Promise<WarehouseDTO[]> {
    return apiGet<WarehouseDTO[]>('/inventory/warehouses')
  },

  async getItems(): Promise<ItemDTO[]> {
    return apiGet<ItemDTO[]>('/inventory/items')
  },

  async getStockByWarehouse(warehouseId: string): Promise<StockItemDTO[]> {
    return apiGet<StockItemDTO[]>(`/inventory/warehouses/${warehouseId}/stock`)
  },

  async getBatches(itemId: string): Promise<BatchDTO[]> {
    return apiGet<BatchDTO[]>(`/inventory/items/${itemId}/batches`)
  },

  async getSerials(itemId: string): Promise<SerialNumberDTO[]> {
    return apiGet<SerialNumberDTO[]>(`/inventory/items/${itemId}/serials`)
  },

  async postAdjustment(dto: AdjustmentCreateDTO): Promise<AdjustmentDTO> {
    return apiPost<AdjustmentDTO>('/inventory/adjustments', dto)
  },
}
