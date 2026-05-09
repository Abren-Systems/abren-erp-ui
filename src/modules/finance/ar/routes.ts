import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: 'invoice/:id?',
    name: 'ARInvoice',
    component: () => import('@/platform/screen-runtime/ScreenRenderer.vue'),
    meta: { screenId: 'AR301000' },
    props: (route) => ({ id: route.params['id'] }),
  },
]

export default routes
