import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: 'requests',
    name: 'PaymentRequestsList',
    component: () => import('./ui/pages/PaymentRequestListPage.vue'),
  },
  {
    path: 'requests/create',
    name: 'PaymentRequestCreate',
    component: () => import('./ui/pages/PaymentRequestCreatePage.vue'),
  },
  {
    path: 'requests/:id',
    name: 'PaymentRequestDetail',
    component: () => import('./ui/pages/PaymentRequestDetailPage.vue'),
    props: true,
  },
] satisfies RouteRecordRaw[]
