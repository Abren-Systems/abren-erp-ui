<script setup lang="ts">
import { ref } from 'vue'
import { AppButton, AppInput, AppDrawer } from '@/shared/components/primitives'
import { useFiscalPeriods } from '../../../application/composables/useFiscalPeriods'
import { computed } from 'vue'

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

const isValid = computed(() => {
  return form.value.name.trim().length > 0 && !!form.value.start_date && !!form.value.end_date
})

async function handleSubmit() {
  if (!isValid.value) return

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
  <AppDrawer
    :open="open"
    title="New Fiscal Period"
    description="Define a new timeframe for financial postings and ledger locking."
    @update:open="emit('update:open', $event)"
  >
    <form class="space-y-6" @submit.prevent="handleSubmit">
      <AppInput label="Period Name" v-model="form.name" placeholder="e.g. FY 2026 Q1" required />

      <div class="grid grid-cols-2 gap-4">
        <AppInput label="Start Date" type="date" v-model="form.start_date" required />
        <AppInput label="End Date" type="date" v-model="form.end_date" required />
      </div>

      <div class="flex justify-end gap-3 pt-6 border-t">
        <AppButton variant="outline" type="button" @click="emit('update:open', false)">
          Cancel
        </AppButton>
        <AppButton variant="primary" type="submit" :disabled="!isValid || isLoading">
          {{ isLoading ? 'Creating...' : 'Create Period' }}
        </AppButton>
      </div>
    </form>
  </AppDrawer>
</template>
