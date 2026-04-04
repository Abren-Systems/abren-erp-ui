import { toId } from '@/shared/types/brand.types'
import type {
  WarehouseId,
  ItemId,
  ProductId,
  StockItemId,
  BatchId,
  SerialNumberId,
} from '@/shared/types/brand.types'
import type { WarehouseDTO, ItemDTO, StockItemDTO, BatchDTO, SerialNumberDTO } from './api.types'
import type { Warehouse, Item, StockItem, Batch, SerialNumber } from '../domain/types'

/**
 * Mapper-as-Factory for the Inventory Module.
 * Transform raw DTOs into high-integrity domain entities.
 */
export class InventoryMapper {
  static toWarehouse(dto: WarehouseDTO): Warehouse {
    return {
      id: toId<WarehouseId>(dto.id),
      name: dto.name,
      code: dto.code,
      isActive: dto.is_active,
      isQuarantine: dto.is_quarantine,
    }
  }

  static toItem(dto: ItemDTO): Item {
    return {
      id: toId<ItemId>(dto.id),
      productId: toId<ProductId>(dto.product_id),
      sku: dto.sku,
      name: dto.name,
      trackingMode: dto.tracking_mode,
    }
  }

  static toStockItem(dto: StockItemDTO): StockItem {
    return {
      id: toId<StockItemId>(dto.id),
      warehouseId: toId<WarehouseId>(dto.warehouse_id),
      itemId: toId<ItemId>(dto.item_id),
      quantity: dto.quantity,
      totalValue: dto.total_value,
      batchId: dto.batch_id ? toId<BatchId>(dto.batch_id) : null,
      serialId: dto.serial_id ? toId<SerialNumberId>(dto.serial_id) : null,
    }
  }

  static toBatch(dto: BatchDTO): Batch {
    return {
      id: toId<BatchId>(dto.id),
      itemId: toId<ItemId>(dto.item_id),
      batchNumber: dto.batch_number,
      productionDate: dto.production_date ?? null,
      expiryDate: dto.expiry_date ?? null,
    }
  }

  static toSerialNumber(dto: SerialNumberDTO): SerialNumber {
    return {
      id: toId<SerialNumberId>(dto.id),
      itemId: toId<ItemId>(dto.item_id),
      serialNumber: dto.serial_number,
      currentStockItemId: dto.current_stock_item_id
        ? toId<StockItemId>(dto.current_stock_item_id)
        : null,
      isAvailable: dto.is_available,
    }
  }
}
