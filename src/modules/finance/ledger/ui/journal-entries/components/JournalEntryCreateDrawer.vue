<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AppButton, AppInput, AppSelect } from '@/shared/components/primitives'
import {
  Plus,
  Trash2,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Calendar,
  DollarSign,
} from 'lucide-vue-next'
import { useJournalEntries } from '../../../application/useJournalEntries'
import { useLedgerAccounts } from '../../../application/useLedgerAccounts'

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
    <SheetContent
      class="sm:max-w-[640px] flex flex-col h-full p-0 overflow-hidden border-none shadow-2xl"
    >
      <SheetHeader class="px-8 py-6 bg-white border-b border-[var(--color-neutral-200)]">
        <div class="flex items-center gap-4">
          <div class="p-2 bg-[var(--color-primary-50)] rounded-sm">
            <BookOpen class="h-5 w-5 text-[var(--color-primary-600)]" />
          </div>
          <div>
            <SheetTitle class="text-lg font-bold text-[var(--color-neutral-900)]"
              >New Journal Entry</SheetTitle
            >
            <SheetDescription class="text-xs text-[var(--color-neutral-500)]">
              Record a double-entry journal. Debits must equal Credits before posting.
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <form
        class="flex-1 overflow-y-auto px-8 py-6 space-y-6 bg-[var(--color-neutral-50)]/30"
        @submit.prevent="handleSubmit"
      >
        <!-- Header fields -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <Label
              class="text-[10px] font-bold uppercase tracking-widest text-[var(--color-neutral-500)] flex items-center gap-1.5"
            >
              <Calendar :size="10" />
              Date <span class="text-[var(--color-danger-600)]">*</span>
            </Label>
            <AppInput type="date" v-model="form.date" />
          </div>
          <div class="space-y-1.5">
            <Label
              class="text-[10px] font-bold uppercase tracking-widest text-[var(--color-neutral-500)] flex items-center gap-1.5"
            >
              <DollarSign :size="10" />
              Currency
            </Label>
            <AppSelect
              v-model="form.base_currency"
              :options="[
                { label: 'ETB — Ethiopian Birr', value: 'ETB' },
                { label: 'USD — US Dollar', value: 'USD' },
                { label: 'EUR — Euro', value: 'EUR' },
              ]"
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <Label
            class="text-[10px] font-bold uppercase tracking-widest text-[var(--color-neutral-500)]"
            >Narrative / Description <span class="text-[var(--color-danger-600)]">*</span></Label
          >
          <AppInput v-model="form.description" placeholder="e.g. Purchase of office supplies" />
        </div>

        <!-- Journal Lines -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3
              class="text-[10px] font-bold uppercase tracking-widest text-[var(--color-neutral-500)]"
            >
              Journal Segments
            </h3>
            <div class="flex gap-2">
              <AppButton type="button" variant="outline" @click="addLine(true)">
                <Plus :size="12" class="mr-1" /> Debit
              </AppButton>
              <AppButton type="button" variant="outline" @click="addLine(false)">
                <Plus :size="12" class="mr-1" /> Credit
              </AppButton>
            </div>
          </div>

          <div class="space-y-2">
            <div
              v-for="(line, idx) in form.lines"
              :key="idx"
              class="grid grid-cols-[1fr_120px_60px_32px] gap-3 items-end p-4 bg-white rounded-sm border border-[var(--color-neutral-200)] shadow-sm"
            >
              <div class="space-y-1.5">
                <span
                  class="text-[10px] font-bold uppercase tracking-wider"
                  :class="
                    line.is_debit
                      ? 'text-[var(--color-primary-600)]'
                      : 'text-[var(--color-success-600)]'
                  "
                >
                  {{ line.is_debit ? 'Debit Account' : 'Credit Account' }}
                </span>
                <AppSelect
                  v-model="line.account_id"
                  placeholder="Select account…"
                  :options="
                    accounts?.map((acc) => ({
                      label: `${acc.code} — ${acc.name}`,
                      value: acc.id,
                    })) ?? []
                  "
                />
              </div>

              <div class="space-y-1.5">
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-[var(--color-neutral-400)]"
                  >Amount</span
                >
                <AppInput
                  v-model="line.amount"
                  type="number"
                  placeholder="0.00"
                  class="text-right tabular-nums font-bold"
                />
              </div>

              <div class="space-y-1.5">
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-[var(--color-neutral-400)]"
                  >CCY</span
                >
                <AppSelect
                  v-model="line.currency"
                  :options="[
                    { label: 'ETB', value: 'ETB' },
                    { label: 'USD', value: 'USD' },
                    { label: 'EUR', value: 'EUR' },
                  ]"
                />
              </div>

              <AppButton
                type="button"
                variant="stealth"
                class="text-[var(--color-neutral-400)] hover:text-[var(--color-danger-600)]"
                :disabled="form.lines.length <= 2"
                @click="removeLine(idx)"
              >
                <Trash2 :size="14" />
              </AppButton>
            </div>
          </div>

          <!-- Balance indicator -->
          <div
            class="mt-4 flex items-center justify-between rounded-sm border border-[var(--color-neutral-200)] bg-white px-6 py-3"
          >
            <div class="space-y-1">
              <p
                class="text-[10px] font-bold uppercase tracking-widest text-[var(--color-neutral-400)]"
              >
                Total Debits
              </p>
              <p class="text-sm font-bold text-[var(--color-neutral-900)] tabular-nums">
                {{ totalDebits.toFixed(2) }}
              </p>
            </div>

            <div class="flex flex-col items-center gap-1">
              <component
                :is="isBalanced ? CheckCircle2 : AlertCircle"
                :size="16"
                :class="
                  isBalanced ? 'text-[var(--color-success-600)]' : 'text-[var(--color-danger-600)]'
                "
              />
              <span
                class="text-[10px] font-bold uppercase tracking-widest"
                :class="
                  isBalanced ? 'text-[var(--color-success-600)]' : 'text-[var(--color-danger-600)]'
                "
              >
                {{ isBalanced ? 'Balanced' : 'Unbalanced' }}
              </span>
            </div>

            <div class="space-y-1 text-right">
              <p
                class="text-[10px] font-bold uppercase tracking-widest text-[var(--color-neutral-400)]"
              >
                Total Credits
              </p>
              <p class="text-sm font-bold text-[var(--color-neutral-900)] tabular-nums">
                {{ totalCredits.toFixed(2) }}
              </p>
            </div>
          </div>
        </div>
      </form>

      <SheetFooter
        class="px-8 py-4 bg-white border-t border-[var(--color-neutral-200)] flex items-center justify-end gap-3"
      >
        <AppButton variant="outline" @click="emit('update:open', false)">Cancel</AppButton>
        <AppButton
          variant="primary"
          :disabled="!form.description || !form.date || !isBalanced || isLoading"
          @click="handleSubmit"
        >
          {{ isLoading ? 'Creating…' : 'Save as Draft' }}
        </AppButton>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
