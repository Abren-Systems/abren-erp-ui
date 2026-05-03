import type { RouteRecordRaw } from 'vue-router'

export default [
  // --- Payment Requests ---
  {
    path: 'requests',
    meta: { title: 'Payment Requests' },
    component: () => import('@/shared/components/workspace/ModuleShell.vue'),
    children: [
      {
        path: '',
        name: 'PaymentRequestsList',
        component: () => import('./ui/payment-requests/pages/PaymentRequestsListPage.vue'),
      },
      {
        path: ':id',
        name: 'PaymentRequestDetail',
        meta: { title: 'Detail' },
        component: () => import('./ui/payment-requests/pages/PaymentRequestFocus.vue'),
        props: true,
      },
    ],
  },

  // --- Vendor Bills ---
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
        path: 'create',
        name: 'VendorBillCreate',
        meta: { title: 'New Bill' },
        component: () => import('./ui/vendor-bills/pages/VendorBillCreatePage.vue'),
      },
      {
        path: ':id',
        name: 'VendorBillDetail',
        meta: { title: 'Detail' },
        component: () => import('./ui/vendor-bills/pages/VendorBillDetailPage.vue'),
        props: true,
      },
    ],
  },
] satisfies RouteRecordRaw[]
