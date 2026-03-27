<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/core/ui/button'
import { Badge } from '@/core/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/core/ui/card'
import { useVendorBill } from '../../application/composables/useVendorBill'
import { Money } from '@/core/domain/money'

const props = defineProps<{ id: string }>()
const router = useRouter()

const { bill, isLoading, validate, isActionPending } = useVendorBill(props.id)

const STATUS_VARIANT: Record<string, 'default' | 'secondary'> = {
  DRAFT: 'secondary',
  VALIDATED: 'default',
  PAID: 'default', // 'success' not in variant type
}

async function handleValidate() {
  if (
    confirm(
      'Validate this vendor bill? This will automatically post an accrual entry to the general ledger.',
    )
  ) {
    await validate()
  }
}

function handleCreatePR() {
  // Pass DTO to Create PR page (In a real app, query params or store orchestration)
  void router.push({ name: 'PaymentRequestCreate' })
}
</script>

<template>
  <div class="p-6 space-y-6 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <button
          class="text-sm text-neutral-500 hover:text-neutral-900 flex items-center gap-1 mb-1"
          @click="router.push({ name: 'VendorBillsList' })"
        >
          ← Back to Bills
        </button>
        <h1 class="text-2xl font-bold tracking-tight">Vendor Bill</h1>
        <code class="text-xs text-neutral-400 font-mono">{{ id }}</code>
      </div>
      <Badge v-if="bill" :variant="STATUS_VARIANT[bill.status] || 'default'">
        {{ bill.status }}
      </Badge>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="text-neutral-500 text-sm py-12 text-center">Loading…</div>

    <template v-else-if="bill">
      <!-- Metadata -->
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt class="text-neutral-500">Vendor ID</dt>
              <dd class="font-medium font-mono text-xs mt-1">{{ bill.vendor_id }}</dd>
            </div>
            <div>
              <dt class="text-neutral-500">Total Amount</dt>
              <dd class="font-bold text-lg mt-1 whitespace-nowrap">
                {{ Money.from(bill.total_amount, bill.currency).format() }}
              </dd>
            </div>
            <div>
              <dt class="text-neutral-500">Bill Number</dt>
              <dd class="mt-1 font-mono text-neutral-900">{{ bill.bill_number }}</dd>
            </div>
            <div>
              <dt class="text-neutral-500">Currency</dt>
              <dd class="mt-1">{{ bill.currency }}</dd>
            </div>
            <div>
              <dt class="text-neutral-500">Issue Date</dt>
              <dd class="mt-1">{{ new Date(bill.issue_date).toLocaleDateString() }}</dd>
            </div>
            <div>
              <dt class="text-neutral-500">Due Date</dt>
              <dd class="mt-1">{{ new Date(bill.due_date).toLocaleDateString() }}</dd>
            </div>
            <div class="col-span-2 mt-2">
              <dt class="text-neutral-500">Justification / Description</dt>
              <dd class="mt-1 text-neutral-900">{{ bill.justification }}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <!-- Line Items -->
      <Card>
        <CardHeader>
          <CardTitle>Expense Lines</CardTitle>
          <CardDescription>{{ bill.lines.length }} item(s) to accrue.</CardDescription>
        </CardHeader>
        <CardContent>
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-neutral-200">
                <th class="text-left py-2 text-neutral-500 font-medium">Description</th>
                <th class="text-right py-2 text-neutral-500 font-medium">Amount</th>
                <th class="text-left py-2 text-neutral-500 font-medium pl-4">GL Account</th>
                <th class="text-left py-2 text-neutral-500 font-medium pl-4">Category</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="line in bill.lines"
                :key="line.id || Math.random().toString()"
                class="border-b border-neutral-100 last:border-0"
              >
                <td class="py-2">{{ line.description }}</td>
                <td class="py-2 text-right font-mono font-semibold">
                  {{ Money.from(line.amount, bill.currency).format() }}
                </td>
                <td class="py-2 pl-4">
                  <code v-if="line.account_id" class="text-xs text-neutral-400">{{
                    line.account_id.slice(0, 8)
                  }}</code>
                  <span v-else class="text-neutral-300 text-xs">—</span>
                </td>
                <td class="py-2 pl-4">
                  <code v-if="line.category_id" class="text-xs text-neutral-400">{{
                    line.category_id.slice(0, 8)
                  }}</code>
                  <span v-else class="text-neutral-300 text-xs">—</span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t border-neutral-200">
                <td class="py-2 font-semibold">Total</td>
                <td class="py-2 text-right font-bold font-mono">
                  {{ Money.from(bill.total_amount, bill.currency).format() }}
                </td>
                <td colspan="2" />
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>

      <!-- Actions -->
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-wrap gap-3">
          <!-- DRAFT → Validate -->
          <Button
            v-if="bill.status === 'DRAFT'"
            variant="default"
            :disabled="isActionPending"
            @click="handleValidate"
          >
            {{ isActionPending ? 'Validating...' : 'Validate & Accrue' }}
          </Button>

          <!-- VALIDATED → Create PR -->
          <template v-if="bill.status === 'VALIDATED'">
            <Button variant="default" @click="handleCreatePR"> Create Payment Request </Button>
          </template>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
