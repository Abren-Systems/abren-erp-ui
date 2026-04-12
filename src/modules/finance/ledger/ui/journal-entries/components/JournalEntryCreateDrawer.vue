<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/shared/components/button'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/shared/components/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select'
import { Plus, Trash2 } from 'lucide-vue-next'
import { useJournalEntries } from '../../../application/composables/useJournalEntries'
import { useLedgerAccounts } from '../../../application/composables/useLedgerAccounts'

/**
 * JournalEntryCreateDrawer — Multi-line double-entry creation form.
 *
 * Creates new DRAFT journal entries with balanced debit/credit lines.
 * On success, navigates directly to the new entry's Detail (Focus Canvas).
 */

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'update:open', val: boolean): void }>()

const router = useRouter()
const { createEntry, isLoading } = useJournalEntries()
const { accounts } = useLedgerAccounts()

type LineItem = {
  account_id: string
  description: string
  amount: string
  is_debit: boolean
  currency: string
}

const form = ref({
  date: new Date().toISOString().split('T')[0],
  description: '',
  base_currency: 'ETB',
  lines: [
    { account_id: '', description: '', amount: '', is_debit: true, currency: 'ETB' },
    { account_id: '', description: '', amount: '', is_debit: false, currency: 'ETB' },
  ] as LineItem[],
})

const totalDebits = computed(() =>
  form.value.lines
    .filter((l) => l.is_debit)
    .reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0),
)
const totalCredits = computed(() =>
  form.value.lines
    .filter((l) => !l.is_debit)
    .reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0),
)
const isBalanced = computed(
  () =>
    totalDebits.value > 0 &&
    totalCredits.value > 0 &&
    Math.abs(totalDebits.value - totalCredits.value) < 0.001,
)

function addLine(isDebit: boolean) {
  form.value.lines.push({
    account_id: '',
    description: '',
    amount: '',
    is_debit: isDebit,
    currency: 'ETB',
  })
}

function removeLine(index: number) {
  if (form.value.lines.length <= 2) return
  form.value.lines.splice(index, 1)
}

async function handleSubmit() {
  if (!isBalanced.value) return
  try {
    const entry = await createEntry({
      date: form.value.date as unknown as Date,
      description: form.value.description,
      base_currency: form.value.base_currency,
      lines: form.value.lines.map((l) => ({
        account_id: l.account_id as unknown as string,
        description: l.description || null,
        amount: parseFloat(l.amount) as unknown as string & number,
        is_debit: l.is_debit,
        currency: l.currency,
      })),
    })

    emit('update:open', false)
    // Progressive Disclosure: navigate immediately to the Focus Canvas
    if (entry?.id) {
      void router.push({
        name: 'LedgerJournalDetail',
        params: { entryId: entry.id },
      })
    }
  } catch {
    // Error handling via the Error Contract in the composable
  }
}
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent class="sm:max-w-[640px] flex flex-col h-full">
      <SheetHeader>
        <SheetTitle>New Journal Entry</SheetTitle>
        <SheetDescription>
          Record a double-entry journal. Debits must equal Credits before posting.
        </SheetDescription>
      </SheetHeader>

      <form class="flex-1 overflow-y-auto py-6 space-y-6" @submit.prevent="handleSubmit">
        <!-- Header fields -->
        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label for="je-date">Date <span class="text-destructive">*</span></Label>
            <Input id="je-date" type="date" v-model="form.date" />
          </div>
          <div class="grid gap-2">
            <Label for="je-currency">Currency</Label>
            <Select v-model="form.base_currency">
              <SelectTrigger id="je-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ETB">ETB — Ethiopian Birr</SelectItem>
                <SelectItem value="USD">USD — US Dollar</SelectItem>
                <SelectItem value="EUR">EUR — Euro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="grid gap-2">
          <Label for="je-description">Description <span class="text-destructive">*</span></Label>
          <Input
            id="je-description"
            v-model="form.description"
            placeholder="e.g. Purchase of office supplies"
          />
        </div>

        <!-- Journal Lines -->
        <div>
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-sm font-semibold">Journal Lines</h3>
            <div class="flex gap-2">
              <Button type="button" variant="outline" size="xs" @click="addLine(true)">
                <Plus :size="12" class="mr-1" /> Debit
              </Button>
              <Button type="button" variant="outline" size="xs" @click="addLine(false)">
                <Plus :size="12" class="mr-1" /> Credit
              </Button>
            </div>
          </div>

          <div class="space-y-2">
            <div
              v-for="(line, idx) in form.lines"
              :key="idx"
              class="grid grid-cols-[1fr_100px_60px_28px] gap-2 items-start rounded-md border p-3"
              :class="
                line.is_debit
                  ? 'border-blue-100 bg-blue-50/30 dark:border-blue-900/30 dark:bg-blue-900/10'
                  : 'border-green-100 bg-green-50/30 dark:border-green-900/30 dark:bg-green-900/10'
              "
            >
              <div class="grid gap-1.5">
                <span
                  class="text-[10px] font-semibold uppercase tracking-wider"
                  :class="line.is_debit ? 'text-blue-500' : 'text-green-500'"
                >
                  {{ line.is_debit ? 'DEBIT' : 'CREDIT' }}
                </span>
                <Select v-model="line.account_id">
                  <SelectTrigger class="h-8 text-xs">
                    <SelectValue placeholder="Select account…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="acc in accounts" :key="acc.id" :value="acc.id">
                      {{ acc.code }} — {{ acc.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="grid gap-1.5">
                <span class="text-[10px] font-semibold uppercase tracking-wider text-neutral-400"
                  >Amount</span
                >
                <Input
                  v-model="line.amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  class="h-8 text-right tabular-nums text-xs font-medium"
                />
              </div>

              <div class="grid gap-1.5">
                <span class="text-[10px] font-semibold uppercase tracking-wider text-neutral-400"
                  >CCY</span
                >
                <Select v-model="line.currency">
                  <SelectTrigger class="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ETB">ETB</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                class="mt-5 h-8 w-7 text-neutral-400 hover:text-destructive"
                :disabled="form.lines.length <= 2"
                @click="removeLine(idx)"
              >
                <Trash2 :size="13" />
              </Button>
            </div>
          </div>

          <!-- Balance indicator -->
          <div class="mt-3 flex items-center justify-between rounded-md border px-4 py-2 text-sm">
            <span class="text-neutral-500"
              >Debits: <strong class="tabular-nums">{{ totalDebits.toFixed(2) }}</strong></span
            >
            <span class="font-medium" :class="isBalanced ? 'text-green-600' : 'text-destructive'">
              {{ isBalanced ? '✓ Balanced' : '✗ Unbalanced' }}
            </span>
            <span class="text-neutral-500"
              >Credits: <strong class="tabular-nums">{{ totalCredits.toFixed(2) }}</strong></span
            >
          </div>
        </div>
      </form>

      <SheetFooter class="border-t pt-4">
        <Button variant="outline" @click="emit('update:open', false)">Cancel</Button>
        <Button
          :disabled="!form.description || !form.date || !isBalanced || isLoading"
          @click="handleSubmit"
        >
          {{ isLoading ? 'Creating…' : 'Save as Draft' }}
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
