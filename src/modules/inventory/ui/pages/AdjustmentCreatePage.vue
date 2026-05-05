<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { AppButton, AppSelect, AppInput } from '@/shared/components/primitives'
import { ClipboardEdit, Plus, Trash2, ArrowLeft } from 'lucide-vue-next'
import { useInventoryAdjustment } from '../../application/useInventoryAdjustment'
import { useWarehouses } from '../../application/useWarehouses'
import type { AdjustmentCreateDTO } from '../../infrastructure/api.types'

const router = useRouter()
const { createAdjustment, isPending: isSubmitting } = useInventoryAdjustment()
const { warehouses } = useWarehouses()

// Native standard schema validation via Zod
const adjustmentSchema = z.object({
  warehouse_id: z.string().min(1, 'Please select a warehouse'),
  reason: z.string().min(5, 'Reason must be at least 5 characters long'),
  lines: z
    .array(
      z.object({
        stock_item_id: z.string().min(1, 'Stock Item ID is required'),
        quantity_delta: z.coerce.number().refine((val) => val !== 0, 'Quantity cannot be zero'),
        valuation_strategy: z.enum(['AUTO', 'MANUAL']),
        manual_unit_cost: z.coerce.number().optional(),
      }),
    )
    .min(1, 'At least one adjustment line is required'),
})

type FormValues = z.infer<typeof adjustmentSchema>

// Setup TanStack Form
const form = useForm({
  defaultValues: {
    warehouse_id: '',
    reason: '',
    lines: [
      {
        stock_item_id: '',
        quantity_delta: 1,
        valuation_strategy: 'AUTO',
      },
    ],
  } as FormValues,
  validators: {
    onChange: adjustmentSchema,
  },
  onSubmit: async ({ value }) => {
    // Adapter cast handles DTO payload conversion
    await createAdjustment(value as AdjustmentCreateDTO)
    router.push({ name: 'inventory.stock' })
  },
})

function addLine() {
  form.pushFieldValue('lines', {
    stock_item_id: '',
    quantity_delta: 1,
    valuation_strategy: 'AUTO',
  })
}

function removeLine(index: number) {
  form.removeFieldValue('lines', index)
}
</script>

<template>
  <div class="flex h-full flex-col bg-[var(--app-canvas)]">
    <!-- Page Header -->
    <div
      class="flex shrink-0 items-center justify-between px-8 py-6 bg-white border-b border-[var(--color-neutral-200)]"
    >
      <div class="flex items-center gap-4">
        <AppButton variant="stealth" @click="router.back()">
          <ArrowLeft :size="18" />
        </AppButton>
        <div class="p-2 bg-[var(--color-primary-50)] rounded-sm">
          <ClipboardEdit class="h-6 w-6 text-[var(--color-primary-600)]" />
        </div>
        <div>
          <h1 class="m-0 text-xl font-bold tracking-tight text-[var(--color-neutral-900)]">
            Post Inventory Adjustment
          </h1>
          <p class="mt-1 text-sm text-[var(--color-neutral-500)]">
            Record manual inventory corrections and valuation overrides.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <AppButton variant="outline" @click="router.back()">Cancel</AppButton>
        <AppButton variant="primary" @click="form.handleSubmit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Posting...' : 'Post Adjustment' }}
        </AppButton>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-8">
      <div class="max-w-4xl mx-auto">
        <form @submit.prevent="form.handleSubmit" class="space-y-6">
          <!-- General Info -->
          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white rounded-sm border border-[var(--color-neutral-200)] shadow-sm"
          >
            <form.Field name="warehouse_id">
              <template #default="{ field, state }">
                <div class="space-y-1.5">
                  <Label
                    class="text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-500)]"
                    >Warehouse</Label
                  >
                  <AppSelect
                    :model-value="field.state.value"
                    @update:model-value="field.handleChange"
                    :options="
                      warehouses?.map((wh) => ({
                        label: `${wh.name} (${wh.code})`,
                        value: wh.id,
                      })) ?? []
                    "
                    placeholder="Select Warehouse"
                  />
                  <p v-if="state.meta.errors.length" class="text-xs text-[var(--color-danger-600)]">
                    {{ state.meta.errors[0] }}
                  </p>
                </div>
              </template>
            </form.Field>

            <form.Field name="reason">
              <template #default="{ field, state }">
                <div class="space-y-1.5">
                  <Label
                    class="text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-500)]"
                    >Reason for Adjustment</Label
                  >
                  <AppInput
                    :model-value="field.state.value"
                    @update:model-value="field.handleChange"
                    placeholder="e.g. Cycle count shrinkage"
                  />
                  <p v-if="state.meta.errors.length" class="text-xs text-[var(--color-danger-600)]">
                    {{ state.meta.errors[0] }}
                  </p>
                </div>
              </template>
            </form.Field>
          </div>

          <!-- Line Items Section -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2
                class="text-xs font-bold uppercase tracking-widest text-[var(--color-neutral-600)]"
              >
                Adjustment Lines
              </h2>
              <AppButton type="button" variant="outline" @click="addLine">
                <Plus :size="14" class="mr-2" />
                Add Line
              </AppButton>
            </div>

            <form.Field name="lines">
              <template #default="{ field }">
                <div class="space-y-4">
                  <div
                    v-for="(line, index) in field.state.value"
                    :key="index"
                    class="grid grid-cols-12 gap-4 items-end p-5 bg-white rounded-sm border border-[var(--color-neutral-200)] shadow-sm"
                  >
                    <!-- Assuming the UI renders a dropdown of available stock items here based on the selected warehouse -->
                    <div class="col-span-12 md:col-span-5 space-y-1.5">
                      <Label
                        class="text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-500)]"
                        >Stock Item ID</Label
                      >
                      <AppInput
                        :model-value="line.stock_item_id"
                        @update:model-value="
                          (val) => form.setFieldValue(`lines[${index}].stock_item_id`, val)
                        "
                        placeholder="UUID..."
                      />
                    </div>

                    <div class="col-span-6 md:col-span-2 space-y-1.5">
                      <Label
                        class="text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-500)]"
                        >Delta</Label
                      >
                      <AppInput
                        type="number"
                        :model-value="line.quantity_delta"
                        @update:model-value="
                          (val) =>
                            form.setFieldValue(`lines[${index}].quantity_delta`, parseFloat(val))
                        "
                      />
                    </div>

                    <div class="col-span-6 md:col-span-3 space-y-1.5">
                      <Label
                        class="text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-500)]"
                        >Valuation</Label
                      >
                      <AppSelect
                        :model-value="line.valuation_strategy"
                        @update:model-value="
                          (val) =>
                            form.setFieldValue(
                              `lines[${index}].valuation_strategy`,
                              val as 'AUTO' | 'MANUAL',
                            )
                        "
                        :options="[
                          { label: 'WAC Auto', value: 'AUTO' },
                          { label: 'Manual Override', value: 'MANUAL' },
                        ]"
                      />
                    </div>

                    <div class="col-span-12 md:col-span-2 text-right">
                      <AppButton
                        type="button"
                        variant="stealth"
                        @click="removeLine(index)"
                        :disabled="field.state.value.length === 1"
                      >
                        <Trash2 :size="16" class="text-[var(--color-danger-600)]" />
                      </AppButton>
                    </div>
                  </div>
                </div>
              </template>
            </form.Field>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
