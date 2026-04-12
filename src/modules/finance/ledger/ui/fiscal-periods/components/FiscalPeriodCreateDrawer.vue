<script setup lang="ts">
import { ref } from 'vue'
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
import { useFiscalPeriods } from '../../../application/composables/useFiscalPeriods'

/**
 * FiscalPeriodCreateDrawer — Slide-out for creating new fiscal periods.
 */

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'update:open', val: boolean): void }>()

const { createPeriod, isLoading } = useFiscalPeriods()

const form = ref({
  name: '',
  start_date: '',
  end_date: '',
})

async function handleSubmit() {
  if (!form.value.name || !form.value.start_date || !form.value.end_date) return

  try {
    await createPeriod({
      name: form.value.name,
      start_date: form.value.start_date as unknown as Date,
      end_date: form.value.end_date as unknown as Date,
    })
    emit('update:open', false)
    form.value = { name: '', start_date: '', end_date: '' }
  } catch {
    // Error Contract handles field errors
  }
}
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent class="sm:max-w-[400px]">
      <SheetHeader>
        <SheetTitle>New Fiscal Period</SheetTitle>
        <SheetDescription>
          Define a new timeframe for financial postings and ledger locking.
        </SheetDescription>
      </SheetHeader>

      <form class="py-6 space-y-5" @submit.prevent="handleSubmit">
        <div class="grid gap-2">
          <Label for="fp-name">Period Name <span class="text-destructive">*</span></Label>
          <Input id="fp-name" v-model="form.name" placeholder="e.g. FY 2026 Q1" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label for="fp-start">Start Date <span class="text-destructive">*</span></Label>
            <Input id="fp-start" type="date" v-model="form.start_date" />
          </div>
          <div class="grid gap-2">
            <Label for="fp-end">End Date <span class="text-destructive">*</span></Label>
            <Input id="fp-end" type="date" v-model="form.end_date" />
          </div>
        </div>

        <SheetFooter class="pt-6 border-t mt-6">
          <Button variant="outline" type="button" @click="emit('update:open', false)">
            Cancel
          </Button>
          <Button
            type="submit"
            :disabled="!form.name || !form.start_date || !form.end_date || isLoading"
          >
            {{ isLoading ? 'Creating…' : 'Create Period' }}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>
