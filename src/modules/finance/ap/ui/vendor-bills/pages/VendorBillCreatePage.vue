<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/shared/components/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'
import { Textarea } from '@/shared/components/textarea'
import { useCreateVendorBill } from '../../../application/composables/useCreateVendorBill'
import { Trash2, Plus } from 'lucide-vue-next'

const router = useRouter()
const { form } = useCreateVendorBill()
</script>

<template>
  <div class="p-6 space-y-6 max-w-3xl mx-auto">
    <!-- Header -->
    <div>
      <button
        class="text-sm text-neutral-500 hover:text-neutral-900 flex items-center gap-1 mb-1"
        @click="router.push({ name: 'VendorBillsList' })"
      >
        ← Back to Bills
      </button>
      <h1 class="text-2xl font-bold tracking-tight">Register Vendor Bill</h1>
      <p class="text-sm text-neutral-500">Record a supplier invoice to generate an AP accrual.</p>
    </div>

    <form
      class="space-y-6"
      @submit.prevent="
        (e) => {
          e.stopPropagation()
          form.handleSubmit()
        }
      "
    >
      <!-- Header fields -->
      <Card>
        <CardHeader>
          <CardTitle>Bill Details</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex gap-4">
            <form.Field name="vendorId">
              <template #default="{ field, state }">
                <div class="flex-1 grid gap-1.5">
                  <Label :for="field.name">Vendor ID <span class="text-rose-500">*</span></Label>
                  <Input
                    :id="field.name"
                    :model-value="field.state.value"
                    placeholder="UUID of the supplier"
                    @update:model-value="(val) => field.handleChange(val as string)"
                  />
                  <p v-if="state.meta.errors.length" class="text-xs text-rose-500">
                    {{ state.meta.errors.join(', ') }}
                  </p>
                </div>
              </template>
            </form.Field>

            <form.Field name="billNumber">
              <template #default="{ field, state }">
                <div class="flex-1 grid gap-1.5">
                  <Label :for="field.name">Bill Number <span class="text-rose-500">*</span></Label>
                  <Input
                    :id="field.name"
                    :model-value="field.state.value"
                    placeholder="e.g. INV-2023-001"
                    @update:model-value="(val) => field.handleChange(val as string)"
                  />
                  <p v-if="state.meta.errors.length" class="text-xs text-rose-500">
                    {{ state.meta.errors.join(', ') }}
                  </p>
                </div>
              </template>
            </form.Field>
          </div>

          <div class="flex gap-4">
            <form.Field name="issueDate">
              <template #default="{ field }">
                <div class="flex-1 grid gap-1.5">
                  <Label :for="field.name">Issue Date</Label>
                  <Input
                    :id="field.name"
                    type="date"
                    :model-value="field.state.value"
                    @update:model-value="(val) => field.handleChange(val as string)"
                  />
                </div>
              </template>
            </form.Field>

            <form.Field name="dueDate">
              <template #default="{ field }">
                <div class="flex-1 grid gap-1.5">
                  <Label :for="field.name">Due Date</Label>
                  <Input
                    :id="field.name"
                    type="date"
                    :model-value="field.state.value"
                    @update:model-value="(val) => field.handleChange(val as string)"
                  />
                </div>
              </template>
            </form.Field>

            <form.Field name="currency">
              <template #default="{ field }">
                <div class="flex-none w-32 grid gap-1.5">
                  <Label :for="field.name">Currency</Label>
                  <Select
                    :model-value="field.state.value"
                    @update:model-value="(val) => field.handleChange(val as string)"
                  >
                    <SelectTrigger :id="field.name">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ETB">ETB</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </template>
            </form.Field>
          </div>

          <form.Field name="justification">
            <template #default="{ field, state }">
              <div class="grid gap-1.5">
                <Label :for="field.name">Justification <span class="text-rose-500">*</span></Label>
                <Textarea
                  :id="field.name"
                  :model-value="field.state.value"
                  rows="2"
                  placeholder="Description of the purchase…"
                  @update:model-value="(val) => field.handleChange(val as string)"
                />
                <p v-if="state.meta.errors.length" class="text-xs text-rose-500">
                  {{ state.meta.errors.join(', ') }}
                </p>
              </div>
            </template>
          </form.Field>
        </CardContent>
      </Card>

      <!-- Line Items -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle>Bill Lines (Expenses)</CardTitle>
              <CardDescription>Line items to be accrued to expense accounts.</CardDescription>
            </div>
            <form.Field name="lines">
              <template #default="{ field }">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  @click="
                    field.pushValue({
                      description: '',
                      amount: 0,
                      accountId: '',
                      categoryId: '',
                    })
                  "
                >
                  <Plus class="w-4 h-4 mr-2" />
                  Add Line
                </Button>
              </template>
            </form.Field>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <form.Field name="lines">
            <template #default="{ field }">
              <div v-for="(_, idx) in field.state.value" :key="idx" class="space-y-4">
                <div
                  class="grid grid-cols-12 gap-4 items-start border border-neutral-100 rounded-lg p-4 bg-neutral-50/30"
                >
                  <div class="col-span-12 flex justify-between items-center">
                    <span class="text-xs font-bold text-neutral-400 uppercase tracking-wider"
                      >Line #{{ (idx as number) + 1 }}</span
                    >
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                      :disabled="field.state.value.length === 1"
                      @click="field.removeValue(idx)"
                    >
                      <Trash2 class="w-4 h-4" />
                    </Button>
                  </div>

                  <form.Field :name="`lines[${idx}].description`" :index="idx">
                    <template #default="{ field: lineField }">
                      <div class="col-span-8 grid gap-1.5">
                        <Label class="text-xs">Description *</Label>
                        <Input
                          size="sm"
                          :model-value="lineField.state.value"
                          placeholder="e.g. Server Hosting"
                          @update:model-value="(val) => lineField.handleChange(val as string)"
                        />
                      </div>
                    </template>
                  </form.Field>

                  <form.Field :name="`lines[${idx}].amount`" :index="idx">
                    <template #default="{ field: lineField }">
                      <div class="col-span-4 grid gap-1.5">
                        <Label class="text-xs">Gross Amount *</Label>
                        <Input
                          size="sm"
                          type="number"
                          step="0.01"
                          :model-value="lineField.state.value"
                          @update:model-value="(val) => lineField.handleChange(Number(val))"
                        />
                      </div>
                    </template>
                  </form.Field>

                  <form.Field :name="`lines[${idx}].accountId`" :index="idx">
                    <template #default="{ field: lineField }">
                      <div class="col-span-6 grid gap-1.5">
                        <Label class="text-xs">GL Account</Label>
                        <Input
                          size="sm"
                          :model-value="lineField.state.value"
                          placeholder="GL Account UUID"
                          @update:model-value="(val) => lineField.handleChange(val as string)"
                        />
                      </div>
                    </template>
                  </form.Field>

                  <form.Field :name="`lines[${idx}].categoryId`" :index="idx">
                    <template #default="{ field: lineField }">
                      <div class="col-span-6 grid gap-1.5">
                        <Label class="text-xs">Category</Label>
                        <Input
                          size="sm"
                          :model-value="lineField.state.value"
                          placeholder="Procurement UUID"
                          @update:model-value="(val) => lineField.handleChange(val as string)"
                        />
                      </div>
                    </template>
                  </form.Field>
                </div>
              </div>
            </template>
          </form.Field>

          <!-- Computed total -->
          <div class="flex justify-between items-center pt-4 border-t border-neutral-200">
            <div class="text-sm font-bold text-neutral-800 flex items-baseline gap-2">
              Gross Total:
              <span class="text-xl font-black tracking-tight font-mono text-blue-600">
                <form.Field name="currency">
                  <template #default="{ field: currencyField }">
                    {{ currencyField.state.value }}
                  </template>
                </form.Field>
                <form.Field name="lines">
                  <template #default="{ field: linesField }">
                    {{
                      (linesField.state.value ?? [])
                        .reduce((s: number, l: any) => s + (parseFloat(l.amount) || 0), 0)
                        .toFixed(2)
                    }}
                  </template>
                </form.Field>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Submit -->
      <div class="flex justify-end gap-3">
        <Button variant="outline" type="button" @click="router.push({ name: 'VendorBillsList' })"
          >Cancel</Button
        >
        <form.Subscribe v-slot="state">
          <Button
            variant="default"
            type="submit"
            :disabled="!state.canSubmit || state.isSubmitting"
          >
            {{ state.isSubmitting ? 'Registering…' : 'Register Bill' }}
          </Button>
        </form.Subscribe>
      </div>
    </form>
  </div>
</template>
