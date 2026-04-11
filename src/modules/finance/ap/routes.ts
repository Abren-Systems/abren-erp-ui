import type { RouteRecordRaw } from 'vue-router'

export default [
  // --- Payment Requests ---
  {
    path: 'requests',
    name: 'PaymentRequestsList',
    component: () => import('./ui/payment-requests/pages/PaymentRequestsListPage.vue'),
  },
  {
    path: 'requests/create',
    name: 'PaymentRequestCreate',
    component: () => import('./ui/payment-requests/pages/PaymentRequestCreatePage.vue'),
  },
  {
    path: 'requests/:id',
    name: 'PaymentRequestDetail',
    component: () => import('./ui/payment-requests/pages/PaymentRequestDetailPage.vue'),
    props: true,
  },

  // --- Vendor Bills ---
  {
    path: 'vendor-bills',
    name: 'VendorBillsList',
    component: () => import('./ui/vendor-bills/pages/VendorBillsListPage.vue'),
  },
  {
    path: 'vendor-bills/create',
    name: 'VendorBillCreate',
    component: () => import('./ui/vendor-bills/pages/VendorBillCreatePage.vue'),
  },
  {
    path: 'vendor-bills/:id',
    name: 'VendorBillDetail',
    component: () => import('./ui/vendor-bills/pages/VendorBillDetailPage.vue'),
    props: true,
  },
] satisfies RouteRecordRaw[]
