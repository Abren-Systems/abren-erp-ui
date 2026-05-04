import type { RouteRecordRaw } from 'vue-router'
import { resolveScreenRoutes } from '@/platform/screen-runtime'
import { apScreens } from './screens'

export default [
  // --- Payment Requests (Screen Runtime) ---
  ...resolveScreenRoutes(apScreens),

  // --- Vendor Bills (Legacy SPA) ---
  {
    path: 'vendor-bills',
    meta: { title: 'Vendor Bills' },
    component: () => import('@/shared/components/workspace/ModuleShell.vue'),
    children: [
      {
        path: '',
        name: 'VendorBillsList',
        component: () => import('./ui/vendor-bills/pages/VendorBillsListPage.vue'),
      },
      {
        path: ':id',
        name: 'VendorBillDetail',
        meta: { title: 'Vendor Bill' },
        component: () => import('./ui/vendor-bills/pages/VendorBillFocus.vue'),
        props: true,
      },
    ],
  },
] satisfies RouteRecordRaw[]
