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
import type {
  Operational,
  WorkflowOperations,
} from '@/platform/workflow-runtime/models/workflows.types'
import { apiGetEnvelope, apiPostEnvelope } from '@/shared/api/http-client'
import {
  WarehouseSchema,
  ItemListSchema,
  StockLevelSchema,
  StockLevelListSchema,
  BatchSchema,
  SerialNumberSchema,
  OperationalAdjustmentSchema,
  AdjustmentListSchema,
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

  async getItems(query?: ListQuery): Promise<ListResponse<ItemDTO>> {
    const raw = await apiGetEnvelope<unknown>('/inventory/items', { params: query })
    const parsed = ItemListSchema.parse(raw.data)
    return {
      items: parsed.items,
      totalCount: parsed.total_count,
    }
  },

  async getStockLevels(query?: ListQuery): Promise<ListResponse<StockLevelDTO>> {
    const raw = await apiGetEnvelope<unknown>('/inventory/stock-positions', { params: query })
    const parsed = StockLevelListSchema.parse(raw.data)
    return {
      items: parsed.items,
      totalCount: parsed.total_count,
    }
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

  async postAdjustment(dto: CreateAdjustmentDTO): Promise<Operational<AdjustmentDTO>> {
    const raw = await apiPostEnvelope<unknown>('/inventory/adjustments', dto)
    const parsed = OperationalAdjustmentSchema.parse(raw)
    return {
      ...(parsed.data as unknown as AdjustmentDTO),
      __operations: parsed.operations as unknown as WorkflowOperations,
    }
  },

  async getAdjustmentById(id: string): Promise<Operational<AdjustmentDTO>> {
    const raw = await apiGetEnvelope<unknown>(`/inventory/adjustments/${id}`)
    const parsed = OperationalAdjustmentSchema.parse(raw)
    return {
      ...(parsed.data as unknown as AdjustmentDTO),
      __operations: parsed.operations as unknown as WorkflowOperations,
    }
  },

  async getAdjustments(query?: ListQuery): Promise<ListResponse<Operational<AdjustmentDTO>>> {
    const raw = await apiGetEnvelope<unknown>('/inventory/adjustments', { params: query })
    const parsed = AdjustmentListSchema.parse(raw.data)

    return {
      items: parsed.items.map((item) => ({
        ...(item.data as unknown as AdjustmentDTO),
        __operations: item.operations as unknown as WorkflowOperations,
      })),
      totalCount: parsed.total_count,
    }
  },
}
