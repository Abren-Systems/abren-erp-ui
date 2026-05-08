import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useScreenController } from '@/platform/screen-runtime'
import {
  useAdjustment,
  useInventoryAdjustment,
  type CreateAdjustmentDTO,
} from '../../application/useInventoryAdjustment'
import { useWarehouses } from '../../application/useWarehouses'
import { IN303000 } from './screen'
import { IN303000_POLICY, type AdjustmentStatus } from './policy'
import { IN303000_FIELDS } from './fields'
import { useField } from '@/platform/field-system/bindings/useField'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import type { AdjustmentDTO } from '../../infrastructure/api.types'

const adjustmentLineSchema = z.object({
  stock_item_id: z.string().uuid('Required'),
  quantity_delta: z.number(),
  valuation_strategy: z.enum(['auto', 'manual']),
  manual_unit_cost: z.number().optional(),
})

const adjustmentSchema = z.object({
  warehouse_id: z.string().uuid('Required'),
  reason: z.string().min(1, 'Required'),
  lines: z.array(adjustmentLineSchema).min(1, 'At least one line required'),
})

type AdjustmentFormValues = z.infer<typeof adjustmentSchema>

export function useAdjustmentController(id: string) {
  const router = useRouter()
  const isNew = computed(() => id === 'new')
  const adjustmentId = computed(() => (isNew.value ? null : id))

  const { adjustment: entity, isLoading, error } = useAdjustment(adjustmentId)
  const { createAdjustment, isPending: isSubmitting } = useInventoryAdjustment()
  const { warehouses } = useWarehouses()

  const form = useForm({
    defaultValues: {
      warehouse_id: '',
      reason: '',
      lines: [
        {
          stock_item_id: '',
          quantity_delta: 1,
          valuation_strategy: 'auto',
        },
      ],
    } as AdjustmentFormValues,
    validators: {
      onChange: adjustmentSchema,
    },
    onSubmit: async ({ value }) => {
      if (isNew.value) {
        await createAdjustment({
          warehouse_id: value.warehouse_id,
          reason: value.reason,
          lines: value.lines,
        } as CreateAdjustmentDTO)
        void router.push({ name: 'inventory.stock' })
      }
    },
  })

  const base = useScreenController<AdjustmentDTO, AdjustmentStatus>({
    screen: IN303000,
    dataSource: {
      entity,
      isLoading,
      error,
    },
    isNew,
    getDomainState: () => (isNew.value ? 'DRAFT' : 'POSTED') as AdjustmentStatus,
    statePolicy: IN303000_POLICY,
  })

  // Attach form to base so useField can find it
  Object.assign(base, { form })

  // Register Commands
  base.registerCommand('post', {
    execute: async () => {
      void form.handleSubmit()
    },
    isPending: isSubmitting,
  })

  const fields = {
    warehouse_id: useField(base, IN303000_FIELDS.warehouse_id),
    reason: useField(base, IN303000_FIELDS.reason),
  }

  const warehouseOptions = computed(
    () =>
      warehouses.value?.map((w) => ({
        label: `${w.code} - ${w.name}`,
        value: w.id,
      })) || [],
  )

  const addLine = () => {
    form.setFieldValue('lines', [
      ...form.getFieldValue('lines'),
      { stock_item_id: '', quantity_delta: 1, valuation_strategy: 'auto' },
    ])
  }

  const removeLine = (index: number) => {
    const current = form.getFieldValue('lines')
    if (current.length > 1) {
      form.setFieldValue(
        'lines',
        current.filter((_, i) => i !== index),
      )
    }
  }

  /** Route line item mutations through TanStack Form for validation tracking */
  const updateLine = (index: number, field: string, value: unknown) => {
    const lines = form
      .getFieldValue('lines')
      .map((line, i) => (i === index ? { ...line, [field]: value } : line))
    form.setFieldValue('lines', lines)
  }

  return {
    ...base,
    fields,
    form, // Exported for custom grid binding
    warehouseOptions,
    isSubmitting,
    addLine,
    removeLine,
    updateLine,
    handlePost: () => base.commands.value['post']?.execute(),
  }
}
