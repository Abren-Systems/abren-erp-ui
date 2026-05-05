import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useScreenController } from '@/platform/screen-runtime'
import { useInventoryAdjustment } from '../../application/useInventoryAdjustment'
import { useWarehouses } from '../../application/useWarehouses'
import type { AdjustmentCreateDTO } from '../../infrastructure/api.types'
import { IN303000 } from './screen'

export function useAdjustmentController(id: string) {
  const router = useRouter()
  const isNew = computed(() => id === 'new')

  const { createAdjustment, isPending: isSubmitting } = useInventoryAdjustment()
  const { warehouses } = useWarehouses()

  const base = useScreenController({
    screen: IN303000,
    dataSource: { entity: computed(() => null), isLoading: ref(false), error: ref(null) },
    isNew,
  })

  const form = ref({
    warehouse_id: '',
    reason: '',
    lines: [
      {
        stock_item_id: '',
        quantity_delta: 1,
        valuation_strategy: 'AUTO' as 'AUTO' | 'MANUAL',
        manual_unit_cost: undefined as number | undefined,
      },
    ],
  })

  function addLine() {
    form.value.lines.push({
      stock_item_id: '',
      quantity_delta: 1,
      valuation_strategy: 'AUTO',
      manual_unit_cost: undefined,
    })
  }

  function removeLine(index: number) {
    if (form.value.lines.length > 1) {
      form.value.lines.splice(index, 1)
    }
  }

  async function handleSubmit() {
    if (!form.value.warehouse_id) {
      alert('Please select a warehouse')
      return
    }
    // Validation mock
    await createAdjustment(form.value as AdjustmentCreateDTO)
    void router.push({ name: 'inventory.stock' })
  }

  return {
    ...base,
    form,
    warehouses,
    isSubmitting,
    addLine,
    removeLine,
    handleSubmit,
  }
}
