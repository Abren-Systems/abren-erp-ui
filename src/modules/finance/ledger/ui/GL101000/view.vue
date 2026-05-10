<script setup lang="ts">
import { useScreenControllerContext } from '@/platform/screen-runtime'
import { AppButton, AppInput } from '@/shared/components/primitives'
import { Plus, Calendar, AlertCircle } from 'lucide-vue-next'

const ctrl = useScreenControllerContext() as any // eslint-disable-line @typescript-eslint/no-explicit-any
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--app-canvas)]">
    <!-- Header Area -->
    <div class="px-8 py-10 border-b border-[var(--app-border)] bg-[var(--app-surface)]">
      <div class="max-w-4xl mx-auto flex items-center gap-6">
        <div
          class="h-16 w-16 rounded-2xl bg-[var(--app-primary-muted)] flex items-center justify-center"
        >
          <Calendar :size="32" class="text-[var(--app-primary)]" />
        </div>
        <div>
          <h1 class="text-3xl font-bold text-[var(--app-text)] tracking-tight">
            Generate Financial Year
          </h1>
          <p class="text-[var(--app-text-muted)] mt-1 text-lg">
            Provision a new fiscal calendar with standard monthly periods.
          </p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto p-8">
      <div class="max-w-4xl mx-auto">
        <div
          class="bg-[var(--app-surface)] rounded-2xl border border-[var(--app-border)] shadow-sm overflow-hidden"
        >
          <div class="p-8 space-y-8">
            <!-- Warning/Info -->
            <div
              class="flex gap-4 p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-900 text-sm"
            >
              <AlertCircle :size="20" class="shrink-0" />
              <p>
                Generating a new fiscal year will create 12 periods based on the dates provided.
                Ensure the start and end dates align with your organizational reporting
                requirements.
              </p>
            </div>

            <!-- Form Fields -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AppInput
                v-model="ctrl.fields.genYear.value"
                label="Fiscal Year (YYYY)"
                placeholder="e.g. 2026"
                :field="ctrl.fields.registry.year"
              />
              <AppInput
                v-model="ctrl.fields.genStartDate.value"
                label="Start Date"
                type="date"
                :field="ctrl.fields.registry.startDate"
              />
              <AppInput
                v-model="ctrl.fields.genEndDate.value"
                label="End Date"
                type="date"
                :field="ctrl.fields.registry.endDate"
              />
            </div>
          </div>

          <!-- Footer Actions -->
          <div
            class="px-8 py-6 bg-[var(--app-surface-subtle)] border-t border-[var(--app-border)] flex justify-end"
          >
            <AppButton
              variant="primary"
              size="lg"
              class="px-8"
              :loading="ctrl.isLoading.value"
              :disabled="!ctrl.isGenerateValid.value"
              @click="ctrl.commands.value['generate']?.execute()"
            >
              <template #start>
                <Plus :size="20" />
              </template>
              Generate Year
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
