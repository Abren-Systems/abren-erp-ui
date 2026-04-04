<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { Button } from '@/shared/components/button'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select'
import { useInventoryAdjustment } from '../../application/composables/useInventoryAdjustment'
import { useWarehouses } from '../../application/composables/useWarehouses'
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
  <div class="max-w-4xl mx-auto p-6 space-y-8">
    <header>
      <h1 class="text-2xl font-bold tracking-tight">Post Inventory Adjustment</h1>
      <p class="text-sm text-muted-foreground mt-1">
        Record manual inventory corrections. Note: Positive adjustments without an PO use manual
        valuation. Negative adjustments use WAC.
      </p>
    </header>

    <form @submit.prevent="form.handleSubmit" class="space-y-6">
      <!-- General Info -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-card rounded-lg border shadow-sm">
        <form.Field name="warehouse_id">
          <template #default="{ field, state }">
            <div class="space-y-2">
              <Label :class="{ 'text-destructive': state.meta.errors.length }">Warehouse</Label>
              <Select :model-value="field.state.value" @update:model-value="field.handleChange">
                <SelectTrigger>
                  <SelectValue placeholder="Select Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="wh in warehouses" :key="wh.id" :value="wh.id">
                    {{ wh.name }} ({{ wh.code }})
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="state.meta.errors.length" class="text-sm text-destructive">
                {{ state.meta.errors[0] }}
              </p>
            </div>
          </template>
        </form.Field>

        <form.Field name="reason">
          <template #default="{ field, state }">
            <div class="space-y-2">
              <Label :class="{ 'text-destructive': state.meta.errors.length }"
                >Reason for Adjustment</Label
              >
              <Input
                :model-value="field.state.value"
                @input="(e: Event) => field.handleChange((e.target as HTMLInputElement).value)"
                placeholder="e.g. Cycle count shrinkage"
              />
              <p v-if="state.meta.errors.length" class="text-sm text-destructive">
                {{ state.meta.errors[0] }}
              </p>
            </div>
          </template>
        </form.Field>
      </div>

      <!-- Line Items Section (Simplified for Demo) -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Adjustment Lines</h2>
          <Button type="button" variant="outline" size="sm" @click="addLine">Add Line</Button>
        </div>

        <form.Field name="lines">
          <template #default="{ field }">
            <div class="space-y-4">
              <div
                v-for="(line, index) in field.state.value"
                :key="index"
                class="grid grid-cols-12 gap-4 items-end p-4 border rounded-md"
              >
                <!-- Assuming the UI renders a dropdown of available stock items here based on the selected warehouse -->
                <div class="col-span-12 md:col-span-5 space-y-2">
                  <Label>Stock Item ID (Simulation)</Label>
                  <Input
                    :value="line.stock_item_id"
                    @input="
                      (e: Event) =>
                        form.setFieldValue(
                          `lines[${index}].stock_item_id`,
                          (e.target as HTMLInputElement).value,
                        )
                    "
                    placeholder="UUID..."
                  />
                </div>

                <div class="col-span-6 md:col-span-2 space-y-2">
                  <Label>Quantity Delta</Label>
                  <Input
                    type="number"
                    :value="line.quantity_delta"
                    @input="
                      (e: Event) =>
                        form.setFieldValue(
                          `lines[${index}].quantity_delta`,
                          parseFloat((e.target as HTMLInputElement).value),
                        )
                    "
                  />
                </div>

                <div class="col-span-6 md:col-span-3 space-y-2">
                  <Label>Valuation</Label>
                  <Select
                    :model-value="line.valuation_strategy"
                    @update:model-value="
                      (val) =>
                        form.setFieldValue(
                          `lines[${index}].valuation_strategy`,
                          val as 'AUTO' | 'MANUAL',
                        )
                    "
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AUTO">WAC Auto</SelectItem>
                      <SelectItem value="MANUAL">Manual Override</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div class="col-span-12 md:col-span-2 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    @click="removeLine(index)"
                    :disabled="field.state.value.length === 1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-trash-2 w-4 h-4 text-destructive"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      <line x1="10" x2="10" y1="11" y2="17" />
                      <line x1="14" x2="14" y1="11" y2="17" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </template>
        </form.Field>
      </div>

      <div class="flex justify-end gap-4 pt-6 mt-6 border-t">
        <Button type="button" variant="outline" @click="router.back()">Cancel</Button>
        <Button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Posting...' : 'Post Adjustment' }}
        </Button>
      </div>
    </form>
  </div>
</template>
