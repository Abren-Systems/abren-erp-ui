import type { BusinessDomain } from '@/shared/types/module.types'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/inventory/warehouses',
    name: 'inventory.warehouses',
    component: () => import('./ui/pages/WarehousesListPage.vue'),
    meta: {
      title: 'Warehouses',
      requiresAuth: true,
      permissions: ['inventory:read'],
    },
  },
  {
    path: '/inventory/stock',
    name: 'inventory.stock',
    component: () => import('./ui/pages/StockItemsListPage.vue'),
    meta: {
      title: 'Stock Positions',
      requiresAuth: true,
      permissions: ['inventory:read'],
    },
  },
  {
    path: '/inventory/adjustments/new',
    name: 'inventory.adjustment-create',
    component: () => import('./ui/pages/AdjustmentCreatePage.vue'),
    meta: {
      title: 'Post Adjustment',
      requiresAuth: true,
      permissions: ['inventory:write'],
    },
  },
]

export const inventoryModule: BusinessDomain = {
  id: 'inventory',
  name: 'Inventory',
  category: 'business',
  permissions: ['inventory:read', 'inventory:write'],
  routes,
  menuItems: [
    {
      label: 'Warehouses',
      route: 'inventory.warehouses',
      icon: 'warehouse',
      permissions: ['inventory:read'],
    },
    {
      label: 'Stock Positions',
      route: 'inventory.stock',
      icon: 'boxes',
      permissions: ['inventory:read'],
    },
  ],
}
