import { h } from 'vue'

export default [
  {
    path: 'accounts',
    name: 'BankAccountsList',
    component: () => Promise.resolve({ render: () => h('div', 'Banking Accounts (Stub)') }),
  },
]
