import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: 'invoice/:id?',
    name: 'ARInvoice',
    component: () => import('./ui/AR301000/AR301000.vue'),
    props: true,
  },
]

export default routes
