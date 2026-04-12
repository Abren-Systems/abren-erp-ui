<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/card'
import { Button } from '@/shared/components/button'
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
import { Trash2, Plus, AlertCircle } from 'lucide-vue-next'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/alert'

/**
 * VendorBillCreatePage — Dedicated creation form.
 *
 * Uses the Macro-Create pattern (Full Page) to support complex 
 * tabular line items and maximum data density.
 */

const router = useRouter()
const { form, error: submissionError } = useCreateVendorBill()

function goBack() {
  router.push({ name: 'VendorBillsList' })
}
</script>

<template>
  <div class="p-6 space-y-6 max-w-4xl mx-auto">
    <!-- Header -->
    <div>
      <button
        class="mb-2 flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
        @click="goBack"
      >
        ← Back to Bills
      </button>
      <h1 class="text-2xl font-bold tracking-tight">Register Vendor Bill</h1>
      <p class="text-sm text-neutral-500">
        Record a supplier invoice to generate an AP accrual.
      </p>
    </div>

    <!-- Submission Error -->
    <Alert v-if="submissionError" variant="destructive" class="mb-6">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>Error registering bill</AlertTitle>
      <AlertDescription>
        {{ submissionError.detail ?? 'An unexpected error occurred.' }}
      </AlertDescription>
    </Alert>

    <form
      class="space-y-6"
      @submit.prevent="(e) => { (e as Event).stopPropagation(); form.handleSubmit() }"
    >
      <Card>
        <CardHeader>
          <CardTitle>Bill Details</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">

            <div class="flex gap-4">
              <form.Field name="vendorId">
                <template #default="{ field, state }">
                  <div class="flex-1 grid gap-1.5">
                    <Label :for="field.name">Vendor ID <span class="text-destructive">*</span></Label>
                    <Input
                      :id="field.name"
                      :model-value="field.state.value"
                      placeholder="UUID of the supplier"
                      @update:model-value="(val) => field.handleChange(val as string)"
                    />
                    <p v-if="state.meta.errors.length" class="text-xs text-destructive">
                      {{ state.meta.errors.join(', ') }}
                    </p>
                  </div>
                </template>
              </form.Field>

              <form.Field name="billNumber">
                <template #default="{ field, state }">
                  <div class="flex-1 grid gap-1.5">
                    <Label :for="field.name">Bill Number <span class="text-destructive">*</span></Label>
                    <Input
                      :id="field.name"
                      :model-value="field.state.value"
                      placeholder="e.g. INV-2023-001"
                      @update:model-value="(val) => field.handleChange(val as string)"
                    />
                    <p v-if="state.meta.errors.length" class="text-xs text-destructive">
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
                  <Label :for="field.name">Justification <span class="text-destructive">*</span></Label>
                  <Textarea
                    :id="field.name"
                    :model-value="field.state.value"
                    rows="2"
                    placeholder="Description of the purchase…"
                    @update:model-value="(val) => field.handleChange(val as string)"
                  />
                  <p v-if="state.meta.errors.length" class="text-xs text-destructive">
                    {{ state.meta.errors.join(', ') }}
                  </p>
                </div>
              </template>
            </form.Field>
          </div>
        </CardContent>
      </Card>

      <!-- Line Items -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold tracking-tight">
              Expense Lines
            </h3>
            <form.Field name="lines">
              <template #default="{ field }">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  class="h-8 text-xs"
                  @click="
                    field.pushValue({ description: '', amount: 0, accountId: '', categoryId: '' })
                  "
                >
                  <Plus class="mr-1 h-3 w-3" /> Add Line
                </Button>
              </template>
            </form.Field>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">

            <form.Field name="lines">
              <template #default="{ field }">
                <div
                  v-for="(_, idx) in field.state.value"
                  :key="idx"
                  class="space-y-3 rounded-lg border p-4"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Line #{{ (idx as number) + 1 }}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      class="h-7 w-7 text-neutral-400 hover:text-destructive"
                      :disabled="field.state.value.length === 1"
                      @click="field.removeValue(idx)"
                    >
                      <Trash2 class="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <form.Field :name="`lines[${idx}].description`" :index="idx">
                      <template #default="{ field: lf }">
                        <div class="grid gap-1.5 flex-1 w-full col-span-2">
                          <Label class="text-xs">Description *</Label>
                          <Input
                            size="sm"
                            :model-value="lf.state.value"
                            placeholder="e.g. Server Hosting"
                            @update:model-value="(val) => lf.handleChange(val as string)"
                          />
                        </div>
                      </template>
                    </form.Field>

                    <form.Field :name="`lines[${idx}].amount`" :index="idx">
                      <template #default="{ field: lf }">
                        <div class="grid gap-1.5">
                          <Label class="text-xs">Gross Amount *</Label>
                          <Input
                            size="sm"
                            type="number"
                            step="0.01"
                            :model-value="lf.state.value"
                            class="text-right tabular-nums"
                            @update:model-value="(val) => lf.handleChange(Number(val))"
                          />
                        </div>
                      </template>
                    </form.Field>

                    <div class="grid grid-cols-2 gap-3 col-span-2">
                      <form.Field :name="`lines[${idx}].accountId`" :index="idx">
                        <template #default="{ field: lf }">
                          <div class="grid gap-1.5">
                            <Label class="text-xs">GL Account</Label>
                            <Input
                              size="sm"
                              :model-value="lf.state.value"
                              placeholder="GL Account UUID"
                              @update:model-value="(val) => lf.handleChange(val as string)"
                            />
                          </div>
                        </template>
                      </form.Field>

                      <form.Field :name="`lines[${idx}].categoryId`" :index="idx">
                        <template #default="{ field: lf }">
                          <div class="grid gap-1.5">
                            <Label class="text-xs">Category</Label>
                            <Input
                              size="sm"
                              :model-value="lf.state.value"
                              placeholder="Procurement UUID"
                              @update:model-value="(val) => lf.handleChange(val as string)"
                            />
                          </div>
                        </template>
                      </form.Field>
                    </div>
                  </div>
                </div>
          </form.Field>
        </CardContent>
      </Card>

      <div class="flex justify-end gap-3 pt-4">
        <Button variant="outline" type="button" @click="goBack">Cancel</Button>
        <form.Subscribe v-slot="state">
          <Button
            :disabled="!state.canSubmit || state.isSubmitting"
            type="submit"
          >
            {{ state.isSubmitting ? 'Registering…' : 'Register Bill' }}
          </Button>
        </form.Subscribe>
      </div>
    </form>
  </div>
</template>
