/**
 * Query Key Factories for Inventory Module
 *
 * Enforces centralized, strictly typed query invalidation.
 */

export const inventoryKeys = {
  all: ['inventory'] as const,
  warehouses: () => [...inventoryKeys.all, 'warehouses'] as const,
  items: () => [...inventoryKeys.all, 'items'] as const,
  stock: (warehouseId?: string) => [...inventoryKeys.all, 'stock', warehouseId] as const,
  batches: (itemId: string) => [...inventoryKeys.all, 'batches', itemId] as const,
  serials: (itemId: string) => [...inventoryKeys.all, 'serials', itemId] as const,
}
