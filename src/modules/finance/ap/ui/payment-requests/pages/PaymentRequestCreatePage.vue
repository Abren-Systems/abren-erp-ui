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
import { useCreatePaymentRequest } from '../../../application/composables/useCreatePaymentRequest'
import { Trash2, Plus, AlertCircle } from 'lucide-vue-next'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/alert'

const router = useRouter()
const { form, error: submissionError } = useCreatePaymentRequest()
</script>

<template>
  <div class="p-6 space-y-6 max-w-3xl mx-auto">
    <!-- Header -->
    <div>
      <button
        class="text-sm text-neutral-500 hover:text-neutral-900 flex items-center gap-1 mb-1"
        @click="router.push({ name: 'PaymentRequestsList' })"
      >
        ← Back to Requests
      </button>
      <h1 class="text-2xl font-bold tracking-tight">New Payment Request</h1>
      <p class="text-sm text-neutral-500">
        Mode 1 — Standalone request. Accrual entry generated on approval.
      </p>
    </div>

    <!-- Global Submission Error -->
    <Alert v-if="submissionError" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>Error creating request</AlertTitle>
      <AlertDescription>
        {{
          submissionError.detail ||
          'An unexpected error occurred. Please check the fields and try again.'
        }}
      </AlertDescription>
    </Alert>

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
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <form.Field name="beneficiaryId">
            <template #default="{ field, state }">
              <div class="grid gap-1.5">
                <Label :for="field.name">Beneficiary ID <span class="text-rose-500">*</span></Label>
                <Input
                  :id="field.name"
                  :model-value="field.state.value"
                  placeholder="UUID of the payee"
                  @update:model-value="(val) => field.handleChange(val as string)"
                />
                <p v-if="state.meta.errors.length" class="text-xs text-rose-500">
                  {{ state.meta.errors.join(', ') }}
                </p>
              </div>
            </template>
          </form.Field>

          <div class="flex gap-4">
            <form.Field name="currency">
              <template #default="{ field }">
                <div class="flex-1 grid gap-1.5">
                  <Label :for="field.name">Currency</Label>
                  <Select
                    :model-value="field.state.value"
                    @update:model-value="(val) => field.handleChange(val as string)"
                  >
                    <SelectTrigger :id="field.name">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ETB">ETB — Ethiopian Birr</SelectItem>
                      <SelectItem value="USD">USD — US Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </template>
            </form.Field>

            <form.Field name="bankAccountId">
              <template #default="{ field }">
                <div class="flex-1 grid gap-1.5">
                  <Label :for="field.name">Bank Account (optional)</Label>
                  <Input
                    :id="field.name"
                    :model-value="field.state.value ?? ''"
                    placeholder="UUID — leave blank for finance"
                    @update:model-value="(val) => field.handleChange((val as string) || null)"
                  />
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
                  rows="3"
                  placeholder="Business justification (reviewed by approvers)…"
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
              <CardTitle>Line Items</CardTitle>
              <CardDescription>
                Each line maps to an expense. Add GL account or category for automatic posting.
              </CardDescription>
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
                      taxAmount: 0,
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
                          placeholder="e.g. Monthly Rent"
                          @update:model-value="(val) => lineField.handleChange(val as string)"
                        />
                      </div>
                    </template>
                  </form.Field>

                  <form.Field :name="`lines[${idx}].amount`" :index="idx">
                    <template #default="{ field: lineField }">
                      <div class="col-span-4 grid gap-1.5">
                        <Label class="text-xs">Amount *</Label>
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
                      <div class="col-span-4 grid gap-1.5">
                        <Label class="text-xs">GL Account</Label>
                        <Input
                          size="sm"
                          :model-value="lineField.state.value"
                          placeholder="UUID"
                          @update:model-value="(val) => lineField.handleChange(val as string)"
                        />
                      </div>
                    </template>
                  </form.Field>

                  <form.Field :name="`lines[${idx}].categoryId`" :index="idx">
                    <template #default="{ field: lineField }">
                      <div class="col-span-4 grid gap-1.5">
                        <Label class="text-xs">Category</Label>
                        <Input
                          size="sm"
                          :model-value="lineField.state.value"
                          placeholder="UUID"
                          @update:model-value="(val) => lineField.handleChange(val as string)"
                        />
                      </div>
                    </template>
                  </form.Field>

                  <form.Field :name="`lines[${idx}].taxAmount`" :index="idx">
                    <template #default="{ field: lineField }">
                      <div class="col-span-4 grid gap-1.5">
                        <Label class="text-xs">WHT Amount</Label>
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
                </div>
              </div>
            </template>
          </form.Field>

          <!-- Computed total -->
          <div class="flex justify-between items-center pt-4 border-t border-neutral-200">
            <div class="text-sm font-bold text-neutral-800 flex items-baseline gap-2">
              Total:
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
                        .reduce((s: number, l: any) => s + (Number(l.amount) || 0), 0)
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
        <Button
          variant="outline"
          type="button"
          @click="router.push({ name: 'PaymentRequestsList' })"
          >Cancel</Button
        >
        <form.Subscribe v-slot="state">
          <Button
            variant="default"
            type="submit"
            :disabled="!state.canSubmit || state.isSubmitting"
          >
            {{ state.isSubmitting ? 'Creating…' : 'Create Request' }}
          </Button>
        </form.Subscribe>
      </div>
    </form>
  </div>
</template>
