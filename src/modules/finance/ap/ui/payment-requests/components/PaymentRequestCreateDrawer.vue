<script setup lang="ts">
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/shared/components/sheet'
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
import { Trash2, Plus, AlertCircle } from 'lucide-vue-next'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/alert'

/**
 * PaymentRequestCreateDrawer — Slide-out creation form.
 *
 * Hosts the full TanStack Form for creating new Payment Requests.
 * On success, closes the drawer and lets the List Page queue refresh via TanStack Query.
 */

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'update:open', val: boolean): void }>()

const { form, error: submissionError } = useCreatePaymentRequest()
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent class="sm:max-w-[680px] flex flex-col h-full">
      <SheetHeader>
        <SheetTitle>New Payment Request</SheetTitle>
        <SheetDescription>
          Standalone request — accrual entry generated automatically on approval.
        </SheetDescription>
      </SheetHeader>

      <!-- Scroll container -->
      <div class="flex-1 overflow-y-auto py-6">
        <!-- Submission Error -->
        <Alert v-if="submissionError" variant="destructive" class="mb-6">
          <AlertCircle class="h-4 w-4" />
          <AlertTitle>Error creating request</AlertTitle>
          <AlertDescription>
            {{ submissionError.detail ?? 'An unexpected error occurred.' }}
          </AlertDescription>
        </Alert>

        <form
          class="space-y-6"
          @submit.prevent="(e) => { (e as Event).stopPropagation(); form.handleSubmit() }"
        >
          <!-- Request Details -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-neutral-400">
              Request Details
            </h3>

            <form.Field name="beneficiaryId">
              <template #default="{ field, state }">
                <div class="grid gap-1.5">
                  <Label :for="field.name">Beneficiary ID <span class="text-destructive">*</span></Label>
                  <Input
                    :id="field.name"
                    :model-value="field.state.value"
                    placeholder="UUID of the payee"
                    @update:model-value="(val) => field.handleChange(val as string)"
                  />
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
                  <Label :for="field.name">Justification <span class="text-destructive">*</span></Label>
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
          </div>

          <!-- Line Items -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold uppercase tracking-wider text-neutral-400">
                Line Items
              </h3>
              <form.Field name="lines">
                <template #default="{ field }">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    class="h-7 text-xs"
                    @click="field.pushValue({ description: '', amount: 0, accountId: '', categoryId: '', taxAmount: 0 })"
                  >
                    <Plus class="mr-1 h-3 w-3" /> Add Line
                  </Button>
                </template>
              </form.Field>
            </div>

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

                    <form.Field :name="`lines[${idx}].amount`" :index="idx">
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
          </div>
        </form>
      </div>

      <SheetFooter class="border-t pt-4">
        <Button variant="outline" @click="emit('update:open', false)">Cancel</Button>
        <form.Subscribe v-slot="state">
          <Button
            :disabled="!state.canSubmit || state.isSubmitting"
            @click="form.handleSubmit()"
          >
            {{ state.isSubmitting ? 'Creating…' : 'Create Request' }}
          </Button>
        </form.Subscribe>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
