import type {
  WarehouseId,
  ItemId,
  ProductId,
  StockItemId,
  BatchId,
  SerialNumberId,
} from '@/shared/types/brand.types'

export type TrackingMode = 'NONE' | 'BATCH' | 'SERIAL'

export interface Warehouse {
  id: WarehouseId
  name: string
  code: string
  isActive: boolean
  isQuarantine: boolean
}

export interface Item {
  id: ItemId
  productId: ProductId
  sku: string
  name: string
  trackingMode: TrackingMode
}

export interface StockItem {
  id: StockItemId
  warehouseId: WarehouseId
  itemId: ItemId
  quantity: number
  totalValue: number
  batchId: BatchId | null
  serialId: SerialNumberId | null
}

export interface Batch {
  id: BatchId
  itemId: ItemId
  batchNumber: string
  productionDate: string | null
  expiryDate: string | null
}

export interface SerialNumber {
  id: SerialNumberId
  itemId: ItemId
  serialNumber: string
  currentStockItemId: StockItemId | null
  isAvailable: boolean
}
