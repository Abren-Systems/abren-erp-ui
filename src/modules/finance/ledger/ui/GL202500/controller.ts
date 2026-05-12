import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useScreenController } from '@/platform/screen-runtime'
import { useLedgerAccounts } from '../../application/useLedgerAccounts'
import { GL202500 } from './screen'
import { GL202500_FIELDS } from './fields'
import { GL202500_POLICY, type AccountStatus } from './policy'
import { useField } from '@/platform/field-system/bindings/useField'
import type { Account } from '../../models/account.types'
import type { AccountId } from '@/shared/types/brand.types'

export function useAccountController(id: AccountId) {
  const router = useRouter()
  const isNew = computed(() => id === 'new')

  // We are grabbing accounts from the list cache.
  // In a real app we would have a specific detail query.
  const { ledgerAccounts, isPending: isLoading } = useLedgerAccounts()
  const account = computed(() => ledgerAccounts.value?.find((a) => a.id === id) ?? null)

  const base = useScreenController<Account, AccountStatus>({
    screen: GL202500,
    dataSource: { entity: account, isLoading, error: ref(null) },
    isNew,
    getDomainState: (ent) => (ent.isActive ? 'ACTIVE' : 'INACTIVE'),
    statePolicy: GL202500_POLICY,
  })

  // Command Execution
  base.registerCommand('deactivate', {
    execute: async () => {
      // TODO: Wire to account deactivation application service
      console.log('Deactivating account', id)
    },
    isPending: computed(() => false),
  })

  const fields = {
    code: useField(base, GL202500_FIELDS.code),
    name: useField(base, GL202500_FIELDS.name),
    type: useField(base, GL202500_FIELDS.type),
    isActive: useField(base, GL202500_FIELDS.isActive),
    currency: useField(base, GL202500_FIELDS.currency),
  }

  return {
    ...base,
    fields,
    router,
  }
}
