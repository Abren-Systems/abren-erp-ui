/**
 * Query Key Factories for Inventory Module
 *
 * Enforces centralized, strictly typed query invalidation.
 */

export const inventoryKeys = {
  all: ['inventory'] as const,
  warehouses: () => [...inventoryKeys.all, 'warehouses'] as const,
  items: (query?: unknown) => [...inventoryKeys.all, 'items', query] as const,
  stockLevels: (query?: unknown) => [...inventoryKeys.all, 'stock-levels', query] as const,
  stock: (warehouseId?: string) =>
    [...inventoryKeys.all, 'stock', 'by-warehouse', warehouseId] as const,
  batches: (itemId: string) => [...inventoryKeys.all, 'batches', itemId] as const,
  serials: (itemId: string) => [...inventoryKeys.all, 'serials', itemId] as const,
  adjustments: (query?: unknown) => [...inventoryKeys.all, 'adjustments', query] as const,
  adjustment: (id: string) => [...inventoryKeys.all, 'adjustments', 'detail', id] as const,
}
