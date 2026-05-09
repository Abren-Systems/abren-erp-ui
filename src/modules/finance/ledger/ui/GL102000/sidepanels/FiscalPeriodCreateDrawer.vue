<script setup lang="ts">
import { useScreenControllerContext } from '@/platform/screen-runtime'
import { AppButton, AppInput, AppSidePane } from '@/shared/components/primitives'

/**
 * FiscalPeriodCreateDrawer — Slide-out for creating new fiscal periods.
 */

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'update:open', val: boolean): void }>()

const ctrl = useScreenControllerContext() as any // eslint-disable-line @typescript-eslint/no-explicit-any
</script>

<template>
  <AppSidePane
    :open="open"
    title="New Fiscal Period"
    description="Define a new timeframe for financial postings and ledger locking."
    @update:open="emit('update:open', $event)"
  >
    <form class="space-y-6" @submit.prevent="ctrl.commands.value['executeCreate']?.execute()">
      <AppInput
        :label="ctrl.fields.registry.name.label"
        v-model="ctrl.fields.createName.value"
        placeholder="e.g. FY 2026 Q1"
        required
      />

      <div class="grid grid-cols-2 gap-4">
        <AppInput
          :label="ctrl.fields.registry.startDate.label"
          type="date"
          v-model="ctrl.fields.createStartDate.value"
          required
        />
        <AppInput
          :label="ctrl.fields.registry.endDate.label"
          type="date"
          v-model="ctrl.fields.createEndDate.value"
          required
        />
      </div>

      <div class="flex justify-end gap-3 pt-6 border-t">
        <AppButton variant="outline" type="button" @click="emit('update:open', false)">
          Cancel
        </AppButton>
        <AppButton
          variant="primary"
          type="submit"
          :disabled="
            !ctrl.isCreateValid.value || ctrl.commands.value['executeCreate']?.isPending.value
          "
        >
          {{
            ctrl.commands.value['executeCreate']?.isPending.value ? 'Creating...' : 'Create Period'
          }}
        </AppButton>
      </div>
    </form>
  </AppSidePane>
</template>
