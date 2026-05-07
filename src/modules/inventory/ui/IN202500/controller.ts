import { computed, watch } from 'vue'
import { useScreenController } from '@/platform/screen-runtime'
import { useStockItem } from '../../application/useStockPositions'
import { useWarehouses } from '../../application/useWarehouses'
import { useItems } from '../../application/useItems'
import { IN202500 } from './screen'
import { IN202500_POLICY, type StockItemStatus } from './policy'
import { IN202500_FIELDS } from './fields'
import { useField } from '@/platform/field-system/bindings/useField'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'

const stockItemSchema = z.object({
  itemId: z.string().uuid('Required'),
  warehouseId: z.string().uuid('Required'),
  quantity: z.number().min(0, 'Must be positive'),
  totalValue: z.number().min(0, 'Must be positive'),
})

type StockItemFormValues = z.infer<typeof stockItemSchema>

export function useStockItemController(id: string) {
  const isNew = computed(() => id === 'new')
  const stockItemId = computed(() => (isNew.value ? null : id))

  const { stockItem: entity, isLoading, error } = useStockItem(stockItemId)
  const { warehouses } = useWarehouses()
  const { items } = useItems()

  const form = useForm({
    defaultValues: {
      itemId: '',
      warehouseId: '',
      quantity: 0,
      totalValue: 0,
    } as StockItemFormValues,
    validators: {
      onChange: stockItemSchema,
    },
    onSubmit: async ({ value }) => {
      if (isNew.value) {
        // TODO: Implement create mutation
        console.warn('[TODO] Create not yet implemented', value)
      } else {
        // TODO: Implement update mutation
        console.warn('[TODO] Update not yet implemented', value)
      }
    },
  })

  const base = useScreenController({
    screen: IN202500,
    dataSource: {
      entity,
      isLoading,
      error,
    },
    isNew,
    getDomainState: () => 'ACTIVE' as StockItemStatus,
    statePolicy: IN202500_POLICY,
  })

  // Attach form to base so useField can find it
  Object.assign(base, { form })

  // Sync server state to form
  watch(
    entity,
    (newVal) => {
      if (newVal && !isNew.value) {
        form.setFieldValue('itemId', newVal.itemId)
        form.setFieldValue('warehouseId', newVal.warehouseId)
        form.setFieldValue('quantity', newVal.quantity)
        form.setFieldValue('totalValue', newVal.totalValue)
      }
    },
    { immediate: true },
  )

  // Register Commands
  base.registerCommand('save', {
    execute: async () => {
      void form.handleSubmit()
    },
    isPending: computed(() => false),
  })

  const fields = {
    itemId: useField(base, IN202500_FIELDS.itemId),
    warehouseId: useField(base, IN202500_FIELDS.warehouseId),
    quantity: useField(base, IN202500_FIELDS.quantity),
    totalValue: useField(base, IN202500_FIELDS.totalValue),
  }

  const warehouseOptions = computed(
    () =>
      warehouses.value?.map((w) => ({
        label: `${w.code} - ${w.name}`,
        value: w.id,
      })) || [],
  )

  const itemOptions = computed(
    () =>
      items.value?.map((i) => ({
        label: `${i.sku} - ${i.name}`,
        value: i.id,
      })) || [],
  )

  return {
    ...base,
    fields,
    warehouseOptions,
    itemOptions,
    handleSave: () => base.commands.value['save']?.execute(),
  }
}
