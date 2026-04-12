import { describe, it, expect } from 'vitest'
import { InventoryMapper } from '../mappers'
import type { WarehouseDTO, ItemDTO, StockLevelDTO } from '../api.types'

describe('InventoryMapper', () => {
  it('should map WarehouseDTO to Warehouse domain entity', () => {
    const dto: WarehouseDTO = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      tenant_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Main Warehouse',
      code: 'WH-001',
      is_active: true,
      is_quarantine: false,
    }

    const domain = InventoryMapper.toWarehouse(dto)

    expect(domain.id).toBe(dto.id)
    expect(domain.name).toBe(dto.name)
    expect(domain.code).toBe(dto.code)
    expect(domain.isActive).toBe(true)
  })

  it('should map ItemDTO to Item domain entity', () => {
    const dto: ItemDTO = {
      id: '550e8400-e29b-41d4-a716-446655440002',
      tenant_id: '550e8400-e29b-41d4-a716-446655440001',
      product_id: '550e8400-e29b-41d4-a716-446655440003',
      sku: 'SKU-123',
      name: 'Laptop X1',
      tracking_mode: 'SERIAL',
    }

    const domain = InventoryMapper.toItem(dto)

    expect(domain.id).toBe(dto.id)
    expect(domain.productId).toBe(dto.product_id)
    expect(domain.sku).toBe(dto.sku)
    expect(domain.trackingMode).toBe('SERIAL')
  })

  it('should map StockLevelDTO to StockItem domain entity with numeric conversion', () => {
    const dto: StockLevelDTO = {
      stock_item_id: '550e8400-e29b-41d4-a716-446655440004',
      warehouse_id: '550e8400-e29b-41d4-a716-446655440000',
      item_id: '550e8400-e29b-41d4-a716-446655440002',
      warehouse_name: 'Main',
      quantity: '10.5',
      total_value: '1050.00',
    }

    const domain = InventoryMapper.toStockItem(dto)

    expect(domain.id).toBe(dto.stock_item_id)
    expect(domain.quantity).toBe(10.5)
    expect(domain.totalValue).toBe(1050.0)
    expect(typeof domain.quantity).toBe('number')
  })
})
