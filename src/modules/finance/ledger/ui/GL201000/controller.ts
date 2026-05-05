import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useScreenController } from '@/platform/screen-runtime'
import { useLedgerAccounts } from '../../application/useLedgerAccounts'
import { GL201000 } from './screen'
import { GL201000_FIELDS } from './fields'
import { useField } from '@/platform/field-system/bindings'

export function useAccountController(id: string) {
  const router = useRouter()
  const isNew = computed(() => id === 'new')

  // We are grabbing accounts from the list cache.
  // In a real app we would have a specific detail query.
  const { accounts, isPending: isLoading } = useLedgerAccounts()
  const account = computed(() => accounts.value?.find((a) => a.id === id) ?? null)

  const base = useScreenController({
    screen: GL201000,
    dataSource: { entity: account, isLoading, error: ref(null) },
    isNew,
  })

  // Command Execution
  base.registerCommand('deactivate', {
    execute: async () => {
      console.log('Deactivating account', id)
      // Call actual application service to deactivate here.
    },
    isPending: computed(() => false),
  })

  const fields = {
    code: useField(base, GL201000_FIELDS.code),
    name: useField(base, GL201000_FIELDS.name),
    type: useField(base, GL201000_FIELDS.type),
    isActive: useField(base, GL201000_FIELDS.isActive),
    currency: useField(base, GL201000_FIELDS.currency),
  }

  return {
    ...base,
    fields,
    router,
  }
}
