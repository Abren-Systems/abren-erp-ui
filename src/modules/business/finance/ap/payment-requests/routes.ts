import { h } from 'vue'

export default [
  {
    path: 'requests',
    name: 'PaymentRequestsList',
    component: () => Promise.resolve({ render: () => h('div', 'Payment Requests (Stub)') }),
  },
]
