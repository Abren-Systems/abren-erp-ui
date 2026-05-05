import { computed, ref } from 'vue'

import { useScreenController } from '@/platform/screen-runtime'
// No individual useStockItem hook currently, mocking it
import type { StockItem } from '../../domain/inventory.types'
import { IN202500 } from './screen'
import { IN202500_FIELDS } from './fields'
import { useField } from '@/platform/field-system/bindings'

export function useStockItemController(id: string) {
  const isNew = computed(() => id === 'new')

  const stockItem = ref<StockItem | null>(null)
  const isLoading = ref(false)
  const error = ref(null)

  const base = useScreenController({
    screen: IN202500,
    dataSource: { entity: stockItem, isLoading, error },
    isNew,
  })

  const fields = {
    itemId: useField(base, IN202500_FIELDS.itemId),
    warehouseId: useField(base, IN202500_FIELDS.warehouseId),
    quantity: useField(base, IN202500_FIELDS.quantity),
    totalValue: useField(base, IN202500_FIELDS.totalValue),
  }

  return {
    ...base,
    fields,
  }
}
