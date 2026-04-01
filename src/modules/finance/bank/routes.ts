import { useAuthStore } from '@/shared/auth/auth.store'
import type { RouteLocationNormalized, NavigationGuardNext, RouteRecordRaw } from 'vue-router'

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
    component: () => import('./ui/pages/BankAccountsListPage.vue'),
  },
] satisfies RouteRecordRaw[]
