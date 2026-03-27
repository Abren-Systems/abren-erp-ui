import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: 'vendor-bills',
    name: 'VendorBillsList',
    component: () => import('./ui/pages/VendorBillListPage.vue'),
  },
  {
    path: 'vendor-bills/create',
    name: 'VendorBillCreate',
    component: () => import('./ui/pages/VendorBillCreatePage.vue'),
  },
  {
    path: 'vendor-bills/:id',
    name: 'VendorBillDetail',
    component: () => import('./ui/pages/VendorBillDetailPage.vue'),
    props: true,
  },
] satisfies RouteRecordRaw[]
