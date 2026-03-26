<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/core/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/core/ui/card'
import { useCreatePaymentRequest } from '../../application/composables/useCreatePaymentRequest'

const router = useRouter()
const { form, lines, addLine, removeLine, create, isSubmitting } = useCreatePaymentRequest()

async function handleSubmit() {
  await create()
}
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

    <!-- Header fields -->
    <Card>
      <CardHeader>
        <CardTitle>Request Details</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1"
            >Beneficiary ID <span class="text-danger-500">*</span></label
          >
          <input
            v-model="form.beneficiaryId"
            type="text"
            class="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="UUID of the payee"
          />
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-neutral-700 mb-1">Currency</label>
            <select
              v-model="form.currency"
              class="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="ETB">ETB — Ethiopian Birr</option>
              <option value="USD">USD — US Dollar</option>
            </select>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-neutral-700 mb-1"
              >Bank Account (optional)</label
            >
            <input
              v-model="form.bankAccountId"
              type="text"
              class="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="UUID — leave blank for finance to select"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1"
            >Justification <span class="text-danger-500">*</span></label
          >
          <textarea
            v-model="form.justification"
            rows="3"
            class="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Business justification (reviewed by approvers)…"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Line Items -->
    <Card>
      <CardHeader>
        <CardTitle>Line Items</CardTitle>
        <CardDescription
          >Each line maps to an expense. Add GL account or category for automatic
          posting.</CardDescription
        >
      </CardHeader>
      <CardContent class="space-y-3">
        <div
          v-for="(line, idx) in lines"
          :key="idx"
          class="grid grid-cols-12 gap-2 items-start border border-neutral-100 rounded-lg p-3"
        >
          <!-- Description -->
          <div class="col-span-4">
            <label class="block text-xs text-neutral-500 mb-1">Description *</label>
            <input
              v-model="line.description"
              type="text"
              class="w-full border border-neutral-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="e.g. Monthly Rent"
            />
          </div>
          <!-- Amount -->
          <div class="col-span-2">
            <label class="block text-xs text-neutral-500 mb-1">Amount *</label>
            <input
              v-model="line.amount"
              type="number"
              step="0.01"
              min="0"
              class="w-full border border-neutral-200 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="0.00"
            />
          </div>
          <!-- GL Account -->
          <div class="col-span-2">
            <label class="block text-xs text-neutral-500 mb-1">GL Account</label>
            <input
              v-model="line.accountId"
              type="text"
              class="w-full border border-neutral-200 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="UUID"
            />
          </div>
          <!-- Category -->
          <div class="col-span-2">
            <label class="block text-xs text-neutral-500 mb-1">Category</label>
            <input
              v-model="line.categoryId"
              type="text"
              class="w-full border border-neutral-200 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="UUID"
            />
          </div>
          <!-- Remove button -->
          <div class="col-span-2 flex items-end justify-end pb-0.5">
            <button
              class="text-xs text-danger-500 hover:text-danger-700 disabled:opacity-30"
              :disabled="lines.length === 1"
              @click="removeLine(idx)"
            >
              Remove
            </button>
          </div>
        </div>

        <!-- Computed total -->
        <div class="flex justify-between items-center pt-1 border-t border-neutral-200">
          <button
            class="text-sm text-primary-600 font-medium hover:text-primary-800"
            type="button"
            @click="addLine"
          >
            + Add Line
          </button>
          <div class="text-sm font-bold text-neutral-800">
            Total:
            <span class="font-mono ml-1">
              {{
                form.currency +
                ' ' +
                lines.reduce((s, l) => s + (parseFloat(l.amount) || 0), 0).toFixed(2)
              }}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Submit -->
    <div class="flex justify-end gap-3">
      <Button variant="outline" @click="router.push({ name: 'PaymentRequestsList' })"
        >Cancel</Button
      >
      <Button
        variant="default"
        :disabled="
          !form.beneficiaryId ||
          !form.justification ||
          lines.some((l) => !l.description || !l.amount) ||
          isSubmitting
        "
        @click="handleSubmit"
      >
        {{ isSubmitting ? 'Creating…' : 'Create Request' }}
      </Button>
    </div>
  </div>
</template>
