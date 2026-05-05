import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useScreenController } from '@/platform/screen-runtime'
// No individual useWarehouse hook currently, mocking it
import type { Warehouse } from '../../domain/inventory.types'
import { IN204000 } from './screen'
import { IN204000_FIELDS } from './fields'
import { useField } from '@/platform/field-system/bindings'

export function useWarehouseController(id: string) {
  const router = useRouter()
  const isNew = computed(() => id === 'new')

  const warehouse = ref<Warehouse | null>(null)
  const isLoading = ref(false)
  const error = ref(null)
  const isCreating = ref(false)

  const base = useScreenController({
    screen: IN204000,
    dataSource: { entity: warehouse, isLoading, error },
    isNew,
  })

  const fields = {
    code: useField(base, IN204000_FIELDS.code),
    name: useField(base, IN204000_FIELDS.name),
    isQuarantine: useField(base, IN204000_FIELDS.isQuarantine),
    isActive: useField(base, IN204000_FIELDS.isActive),
  }

  const form = ref({
    code: '',
    name: '',
    isQuarantine: false,
    isActive: true,
  })

  async function handleSubmit() {
    // Mock save
    isCreating.value = true
    setTimeout(() => {
      isCreating.value = false
      void router.push({ name: 'inventory.warehouses' })
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
