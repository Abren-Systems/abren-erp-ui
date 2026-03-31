import { h } from 'vue'
import { useAuthStore } from '@/shared/auth/auth.store'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

export default [
  {
    path: 'accounts',
    name: 'BankAccountsList',
    beforeEnter: (
      _to: RouteLocationNormalized,
      _from: RouteLocationNormalized,
      next: NavigationGuardNext,
    ) => {
      if (!useAuthStore().hasFeature('bank_accounts')) return next('/app')
      next()
    },
    component: () =>
      Promise.resolve({
        render: () =>
          h(
            'div',
            { class: 'p-8 text-center text-neutral-500 font-medium' },
            'Banking Accounts (Stub)',
          ),
      }),
  },
]
