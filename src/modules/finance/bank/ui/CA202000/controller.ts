import { computed, ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { useScreenController } from '@/platform/screen-runtime'
import type { BankAccount } from '../../models/bank.types'
import { CA202000 } from './screen'
import { CA202000_FIELDS } from './fields'
import { CA202000_POLICY, type BankAccountStatus } from './policy'
import { useField } from '@/platform/field-system/bindings'

export function useBankAccountController(id: string) {
  const router = useRouter()
  const isNew = computed(() => id === 'new')

  const account = shallowRef<BankAccount | null>(null)
  const isLoading = ref(false)
  const error = ref(null)
  const isCreating = ref(false)

  const base = useScreenController<BankAccount, BankAccountStatus>({
    screen: CA202000,
    dataSource: { entity: account, isLoading, error },
    isNew,
    getDomainState: (entity) => entity.status,
    statePolicy: CA202000_POLICY,
  })

  const fields = {
    accountName: useField(base, CA202000_FIELDS.accountName),
    accountNumber: useField(base, CA202000_FIELDS.accountNumber),
    bankName: useField(base, CA202000_FIELDS.bankName),
    currency: useField(base, CA202000_FIELDS.currency),
    isDefault: useField(base, CA202000_FIELDS.isDefault),
    status: useField(base, CA202000_FIELDS.status),
  }

  const form = ref({
    accountName: '',
    accountNumber: '',
    bankName: '',
    currency: 'ETB',
    isDefault: false,
    status: 'ACTIVE',
  })

  async function handleSubmit() {
    isCreating.value = true
    setTimeout(() => {
      isCreating.value = false
      void router.push({ name: 'finance.bank.accounts' })
    }, 500)
  }

  return {
    ...base,
    fields,
    form,
    isCreating,
    handleSubmit,
  }
}
