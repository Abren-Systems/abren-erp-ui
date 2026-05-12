import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useScreenController } from '@/platform/screen-runtime'
import { useWarehouse, useCreateWarehouse } from '../../application/useWarehouses'
import { IN204000 } from './screen'
import { IN204000_POLICY, type WarehouseStatus } from './policy'
import { IN204000_FIELDS } from './fields'
import { useField } from '@/platform/field-system/bindings/useField'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import type { Warehouse } from '../../models/inventory.types'
import type { WarehouseId } from '@/shared/types/brand.types'

const warehouseSchema = z.object({
  code: z.string().min(1, 'Required'),
  name: z.string().min(1, 'Required'),
  isQuarantine: z.boolean(),
  isActive: z.boolean(),
})

type WarehouseFormValues = z.infer<typeof warehouseSchema>

export function useWarehouseController(id: string) {
  const router = useRouter()
  const isNew = computed(() => id === 'new')
  const warehouseId = computed(() => (isNew.value ? null : (id as WarehouseId)))

  const { warehouse: entity, isLoading, error } = useWarehouse(warehouseId)
  const { createWarehouse, isCreating } = useCreateWarehouse()

  const form = useForm({
    defaultValues: {
      code: '',
      name: '',
      isQuarantine: false,
      isActive: true,
    } as WarehouseFormValues,
    validators: {
      onChange: warehouseSchema,
    },
    onSubmit: async ({ value }) => {
      if (isNew.value) {
        await createWarehouse(value)
        void router.push({ name: 'inventory.warehouses' })
      } else {
        // TODO: Implement update mutation
        console.warn('[TODO] Update not yet implemented', value)
      }
    },
  })

  const base = useScreenController({
    screen: IN204000,
    dataSource: {
      entity,
      isLoading,
      error,
    },
    isNew,
    getDomainState: (ent: Warehouse) => (ent.isActive ? 'ACTIVE' : 'INACTIVE') as WarehouseStatus,
    statePolicy: IN204000_POLICY,
  })

  // Attach form to base so useField can find it
  Object.assign(base, { form })

  // Sync server state to form
  watch(
    entity,
    (newVal) => {
      if (newVal && !isNew.value) {
        form.setFieldValue('code', newVal.code)
        form.setFieldValue('name', newVal.name)
        form.setFieldValue('isQuarantine', newVal.isQuarantine)
        form.setFieldValue('isActive', newVal.isActive)
      }
    },
    { immediate: true },
  )

  // Register Commands
  base.registerCommand('save', {
    execute: async () => {
      void form.handleSubmit()
    },
    isPending: isCreating,
  })

  const fields = {
    code: useField(base, IN204000_FIELDS.code),
    name: useField(base, IN204000_FIELDS.name),
    isQuarantine: useField(base, IN204000_FIELDS.isQuarantine),
    isActive: useField(base, IN204000_FIELDS.isActive),
  }

  return {
    ...base,
    fields,
    handleSave: () => base.commands.value['save']?.execute(),
  }
}
