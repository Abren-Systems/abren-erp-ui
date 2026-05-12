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
import type { ListQuery, ListResponse } from '@/shared/domain/pagination'
import type { Operational } from '@/platform/workflow-runtime/models/workflows.types'
import { apiGetEnvelope, apiPostEnvelope } from '@/shared/api/http-client'
import {
  mapOperational,
  mapOperationalList,
  type OperationalDTO,
  type OperationalListDTO,
} from '@/platform/workflow-runtime/utils/operational'
import { InventoryMapper } from './mappers'
import { WarehouseSchema, StockLevelSchema, BatchSchema, SerialNumberSchema } from './api.schemas'
import type { WarehouseId, StockItemId, ItemId, AdjustmentId } from '@/shared/types/brand.types'
import type { Adjustment } from '../models/inventory.types'

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

  async getWarehouseById(id: WarehouseId): Promise<WarehouseDTO> {
    const raw = await apiGet<unknown>(`/inventory/warehouses/${id}`)
    return WarehouseSchema.parse(raw)
  },

  async createWarehouse(dto: Partial<WarehouseDTO>): Promise<WarehouseDTO> {
    const raw = await apiPost<unknown>('/inventory/warehouses', dto)
    return WarehouseSchema.parse(raw)
  },

  async getItems(query?: ListQuery): Promise<ListResponse<ItemDTO>> {
    const raw = await apiGetEnvelope<ListResponse<ItemDTO>>('/inventory/items', { params: query })
    return raw.data
  },

  async getStockLevels(query?: ListQuery): Promise<ListResponse<StockLevelDTO>> {
    const raw = await apiGetEnvelope<ListResponse<StockLevelDTO>>('/inventory/stock-positions', {
      params: query,
    })
    return raw.data
  },

  async getStockByWarehouse(warehouseId: WarehouseId): Promise<StockLevelDTO[]> {
    const raw = await apiGet<unknown[]>(`/inventory/warehouses/${warehouseId}/stock`)
    return raw.map((item) => StockLevelSchema.parse(item))
  },

  async getStockItemById(stockItemId: StockItemId): Promise<StockLevelDTO> {
    const raw = await apiGet<unknown>(`/inventory/stock/${stockItemId}`)
    return StockLevelSchema.parse(raw)
  },

  async getBatches(itemId: ItemId): Promise<BatchDTO[]> {
    const raw = await apiGet<unknown[]>(`/inventory/items/${itemId}/batches`)
    return raw.map((item) => BatchSchema.parse(item))
  },

  async getSerials(itemId: ItemId): Promise<SerialNumberDTO[]> {
    const raw = await apiGet<unknown[]>(`/inventory/items/${itemId}/serials`)
    return raw.map((item) => SerialNumberSchema.parse(item))
  },

  async postAdjustment(dto: CreateAdjustmentDTO): Promise<Operational<Adjustment>> {
    const raw = await apiPostEnvelope<OperationalDTO<AdjustmentDTO>>('/inventory/adjustments', dto)
    return mapOperational(raw.data, (dto: AdjustmentDTO) => InventoryMapper.toAdjustment(dto))
  },

  async getAdjustmentById(id: AdjustmentId): Promise<Operational<Adjustment>> {
    const raw = await apiGetEnvelope<OperationalDTO<AdjustmentDTO>>(`/inventory/adjustments/${id}`)
    return mapOperational(raw.data, (dto: AdjustmentDTO) => InventoryMapper.toAdjustment(dto))
  },

  async getAdjustments(query?: ListQuery): Promise<ListResponse<Operational<Adjustment>>> {
    const raw = await apiGetEnvelope<OperationalListDTO<AdjustmentDTO>>('/inventory/adjustments', {
      params: query,
    })
    return mapOperationalList(raw.data, (dto: AdjustmentDTO) => InventoryMapper.toAdjustment(dto))
  },
}
