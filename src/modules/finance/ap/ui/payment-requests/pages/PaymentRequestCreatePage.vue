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
import { useCreatePaymentRequest } from '../../../application/composables/useCreatePaymentRequest'
import { useFormPersistence } from '@/shared/composables/useFormPersistence'
import { Trash2, Plus, AlertCircle } from 'lucide-vue-next'
import { useUsers } from '@/modules/core/application/composables/useUsers'
import SelectLedgerAccount from '@/shared/components/finance/SelectLedgerAccount.vue'

/**
 * PaymentRequestCreatePage — Dedicated creation form.
 *
 * Uses the Macro-Create pattern (Full Page) to support complex
 * tabular line items and maximum data density.
 */

const router = useRouter()
const { form, error: submissionError } = useCreatePaymentRequest()
const { users, isPending: isLoadingUsers } = useUsers()

// Draft Persistence
useFormPersistence(form, 'abren_draft_payment_request')

function goBack() {
  router.push({ name: 'PaymentRequestsList' })
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
        ← Back to Requests
      </button>
      <h1 class="text-2xl font-bold tracking-tight">New Payment Request</h1>
      <p class="text-sm text-neutral-500">
        Standalone request — accrual entry generated automatically on approval.
      </p>
    </div>

    <!-- Submission Error -->
    <div
      v-if="submissionError"
      class="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
    >
      <AlertCircle class="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <h3 class="text-sm font-semibold">Error creating request</h3>
        <p class="mt-1 text-sm">
          {{ submissionError.detail ?? 'An unexpected error occurred.' }}
        </p>
      </div>
    </div>

    <form
      class="space-y-6"
      @submit.prevent="
        (e) => {
          ;(e as Event).stopPropagation()
          form.handleSubmit()
        }
      "
    >
      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <form.Field name="beneficiaryId">
            <template #default="{ field, state }">
              <div class="grid gap-1.5">
                <Label :for="field.name">Beneficiary <span class="text-destructive">*</span></Label>
                <Select
                  :model-value="field.state.value"
                  @update:model-value="(val) => field.handleChange(val as string)"
                  :disabled="isLoadingUsers"
                >
                  <SelectTrigger :id="field.name">
                    <SelectValue placeholder="Select payee..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="user in users" :key="user.id" :value="user.id">
                      {{ user.email }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p v-if="state.meta.errors.length" class="text-xs text-destructive">
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
                    placeholder="Leave blank for finance to assign"
                    @update:model-value="(val) => field.handleChange((val as string) || null)"
                  />
                </div>
              </template>
            </form.Field>
          </div>

          <form.Field name="justification">
            <template #default="{ field, state }">
              <div class="grid gap-1.5">
                <Label :for="field.name"
                  >Justification <span class="text-destructive">*</span></Label
                >
                <Textarea
                  :id="field.name"
                  :model-value="field.state.value"
                  rows="3"
                  placeholder="Business justification reviewed by approvers…"
                  @update:model-value="(val) => field.handleChange(val as string)"
                />
                <p v-if="state.meta.errors.length" class="text-xs text-destructive">
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
            <CardTitle>Line Items</CardTitle>
            <form.Field name="lines">
              <template #default="{ field }">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  class="h-7 text-xs"
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

                <div class="grid grid-cols-12 gap-3">
                  <form.Field
                    :name="`lines[${idx}].description`"
                    :index="idx"
                    class="col-span-12 md:col-span-5"
                  >
                    <template #default="{ field: lf }">
                      <div class="grid gap-1.5">
                        <Label class="text-xs">Description *</Label>
                        <Input
                          size="sm"
                          :model-value="lf.state.value"
                          placeholder="e.g. Monthly Rent"
                          @update:model-value="(val) => lf.handleChange(val as string)"
                        />
                      </div>
                    </template>
                  </form.Field>

                  <form.Field
                    :name="`lines[${idx}].accountId`"
                    :index="idx"
                    class="col-span-12 md:col-span-4"
                  >
                    <template #default="{ field: lf }">
                      <div class="grid gap-1.5">
                        <Label class="text-xs">GL Account *</Label>
                        <SelectLedgerAccount
                          :model-value="lf.state.value"
                          @update:model-value="(val) => lf.handleChange(val)"
                        />
                      </div>
                    </template>
                  </form.Field>

                  <form.Field
                    :name="`lines[${idx}].amount`"
                    :index="idx"
                    class="col-span-12 md:col-span-3"
                  >
                    <template #default="{ field: lf }">
                      <div class="grid gap-1.5">
                        <Label class="text-xs">Amount *</Label>
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
                </div>
              </div>
            </template>
          </form.Field>
        </CardContent>
      </Card>

      <div class="flex justify-end gap-3 pt-4">
        <Button variant="outline" type="button" @click="goBack">Cancel</Button>
        <form.Subscribe v-slot="state">
          <Button :disabled="!state.canSubmit || state.isSubmitting" type="submit">
            {{ state.isSubmitting ? 'Creating…' : 'Create Request' }}
          </Button>
        </form.Subscribe>
      </div>
    </form>
  </div>
</template>
