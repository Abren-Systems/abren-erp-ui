<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/core/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/core/ui/card'
import { useCreateVendorBill } from '../../application/composables/useCreateVendorBill'

const router = useRouter()
const { form, lines, addLine, removeLine, create, isSubmitting } = useCreateVendorBill()

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
        @click="router.push({ name: 'VendorBillsList' })"
      >
        ← Back to Bills
      </button>
      <h1 class="text-2xl font-bold tracking-tight">Register Vendor Bill</h1>
      <p class="text-sm text-neutral-500">Record a supplier invoice to generate an AP accrual.</p>
    </div>

    <!-- Header fields -->
    <Card>
      <CardHeader>
        <CardTitle>Bill Details</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-neutral-700 mb-1"
              >Vendor ID <span class="text-danger-500">*</span></label
            >
            <input
              v-model="form.vendorId"
              type="text"
              class="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="UUID of the supplier"
            />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-neutral-700 mb-1"
              >Bill Number <span class="text-danger-500">*</span></label
            >
            <input
              v-model="form.billNumber"
              type="text"
              class="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. INV-2023-001"
            />
          </div>
        </div>

        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-neutral-700 mb-1">Issue Date</label>
            <input
              v-model="form.issueDate"
              type="date"
              class="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-neutral-700 mb-1">Due Date</label>
            <input
              v-model="form.dueDate"
              type="date"
              class="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div class="flex-none w-32">
            <label class="block text-sm font-medium text-neutral-700 mb-1">Currency</label>
            <select
              v-model="form.currency"
              class="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="ETB">ETB</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1"
            >Justification <span class="text-danger-500">*</span></label
          >
          <textarea
            v-model="form.justification"
            rows="2"
            class="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Description of the purchase…"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Line Items -->
    <Card>
      <CardHeader>
        <CardTitle>Bill Lines (Expenses)</CardTitle>
        <CardDescription>Line items to be accrued to expense accounts.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <div
          v-for="(line, idx) in lines"
          :key="idx"
          class="flex flex-col gap-2 border border-neutral-100 rounded-lg p-3"
        >
          <!-- Row 1 -->
          <div class="grid grid-cols-12 gap-2 items-start">
            <!-- Description -->
            <div class="col-span-8">
              <label class="block text-xs text-neutral-500 mb-1">Description *</label>
              <input
                v-model="line.description"
                type="text"
                class="w-full border border-neutral-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="e.g. Server Hosting"
              />
            </div>
            <!-- Amount -->
            <div class="col-span-4">
              <label class="block text-xs text-neutral-500 mb-1">Gross Amount *</label>
              <input
                v-model="line.amount"
                type="number"
                step="0.01"
                min="0"
                class="w-full border border-neutral-200 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <!-- Row 2 -->
          <div class="grid grid-cols-12 gap-2 items-start">
            <!-- Tax Rule -->
            <div class="col-span-3">
              <label class="block text-xs text-neutral-500 mb-1">Tax Rule (Opt)</label>
              <input
                v-model="line.taxRuleId"
                type="text"
                class="w-full border border-neutral-200 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Tax Rule UUID"
              />
            </div>
            <!-- Tax Amount -->
            <div class="col-span-2">
              <label class="block text-xs text-neutral-500 mb-1">Tax Amt</label>
              <input
                v-model="line.taxAmount"
                type="number"
                step="0.01"
                min="0"
                class="w-full border border-neutral-200 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="0.00"
              />
            </div>
            <!-- GL Account -->
            <div class="col-span-3">
              <label class="block text-xs text-neutral-500 mb-1">GL Account</label>
              <input
                v-model="line.accountId"
                type="text"
                class="w-full border border-neutral-200 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="GL Account UUID"
              />
            </div>
            <!-- Category -->
            <div class="col-span-3">
              <label class="block text-xs text-neutral-500 mb-1">Category</label>
              <input
                v-model="line.categoryId"
                type="text"
                class="w-full border border-neutral-200 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Procurement UUID"
              />
            </div>
            <!-- Remove button -->
            <div class="col-span-1 flex items-end justify-end pb-0.5">
              <button
                class="text-xs text-danger-500 hover:text-danger-700 disabled:opacity-30"
                :disabled="lines.length === 1"
                @click="removeLine(idx)"
              >
                Del
              </button>
            </div>
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
          <div class="flex items-center gap-6 text-sm font-bold text-neutral-800">
            <div>
              Tax:
              <span class="font-mono ml-1 text-neutral-500 font-normal">
                {{
                  form.currency +
                  ' ' +
                  lines.reduce((s, l) => s + (parseFloat(l.taxAmount) || 0), 0).toFixed(2)
                }}
              </span>
            </div>
            <div>
              Gross Total:
              <span class="font-mono ml-1">
                {{
                  form.currency +
                  ' ' +
                  lines.reduce((s, l) => s + (parseFloat(l.amount) || 0), 0).toFixed(2)
                }}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Submit -->
    <div class="flex justify-end gap-3">
      <Button variant="outline" @click="router.push({ name: 'VendorBillsList' })">Cancel</Button>
      <Button
        variant="default"
        :disabled="
          !form.vendorId ||
          !form.billNumber ||
          !form.justification ||
          lines.some((l) => !l.description || !l.amount) ||
          isSubmitting
        "
        @click="handleSubmit"
      >
        {{ isSubmitting ? 'Registering…' : 'Register Bill' }}
      </Button>
    </div>
  </div>
</template>
