<script setup lang="ts">
import { BusinessDate } from '@/shared/domain/business-date'
import ReportingChart from './ReportingChart.vue'
import { AppButton } from '@/shared/components/primitives'
import { LayoutDashboard, FileDown, Calendar } from 'lucide-vue-next'
import { useCashflowDashboard } from './useCashflowDashboard'

const ctrl = useCashflowDashboard()
</script>

<template>
  <div class="flex h-full flex-col bg-[var(--app-canvas)]">
    <!-- Page Header -->
    <div
      class="flex shrink-0 items-center justify-between px-8 py-6 bg-white border-b border-[var(--color-neutral-200)]"
    >
      <div class="flex items-center gap-4">
        <div class="p-2 bg-[var(--color-primary-50)] rounded-sm">
          <LayoutDashboard class="h-6 w-6 text-[var(--color-primary-600)]" />
        </div>
        <div>
          <h1 class="m-0 text-xl font-bold tracking-tight text-[var(--color-neutral-900)]">
            Financial Insights
          </h1>
          <p class="mt-1 text-sm text-[var(--color-neutral-500)]">
            Real-time dual-layer cashflow reporting engine.
          </p>
        </div>
      </div>

      <div
        class="flex items-center gap-2 bg-[var(--color-neutral-50)] p-1 rounded-sm border border-[var(--color-neutral-200)]"
      >
        <AppButton variant="stealth" size="sm" class="bg-white shadow-sm font-bold"
          >Daily</AppButton
        >
        <AppButton variant="stealth" size="sm">Weekly</AppButton>
        <AppButton variant="stealth" size="sm">Monthly</AppButton>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-8 space-y-8">
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="stat in ctrl.displayStats.value"
          :key="stat.name"
          class="p-6 bg-white rounded-sm border border-[var(--color-neutral-200)] shadow-sm"
        >
          <div class="flex items-center gap-4">
            <div :class="[stat.bg, 'p-3 rounded-sm']">
              <component :is="stat.icon" :class="[stat.color, 'w-5 h-5']" />
            </div>
            <div>
              <p
                class="text-[10px] font-bold uppercase tracking-widest text-[var(--color-neutral-500)]"
              >
                {{ stat.name }}
              </p>
              <p class="text-2xl font-bold text-[var(--color-neutral-900)] mt-0.5 tabular-nums">
                {{ stat.value }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div class="bg-white rounded-sm border border-[var(--color-neutral-200)] p-6 shadow-sm">
          <ReportingChart
            title="Inflow: Actual vs Committed"
            :data="
              (ctrl.entries.value ?? []).map((d) => ({
                date: d.date,
                actual: d.actualInflow.amount,
                projected: d.projectedInflow.amount,
              }))
            "
          />
        </div>
        <div class="bg-white rounded-sm border border-[var(--color-neutral-200)] p-6 shadow-sm">
          <ReportingChart
            title="Outflow: Actual vs Committed"
            :data="
              (ctrl.entries.value ?? []).map((d) => ({
                date: d.date,
                actual: d.actualOutflow.amount,
                projected: d.projectedOutflow.amount,
              }))
            "
          />
        </div>
      </div>

      <!-- Detailed Table Section -->
      <section
        class="bg-white rounded-sm border border-[var(--color-neutral-200)] shadow-sm overflow-hidden flex flex-col"
      >
        <div
          class="px-8 py-4 border-b border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] flex items-center justify-between"
        >
          <h2
            class="text-xs font-bold uppercase tracking-widest text-[var(--color-neutral-600)] flex items-center gap-2"
          >
            <Calendar :size="14" />
            Transactional Timeline
          </h2>
          <AppButton variant="outline" size="sm">
            <FileDown :size="14" class="mr-2" />
            Export Report
          </AppButton>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr
                class="bg-[var(--color-neutral-50)] text-[var(--color-neutral-400)] text-[10px] font-bold uppercase tracking-widest border-b border-[var(--color-neutral-100)]"
              >
                <th class="px-8 py-3">Reporting Date</th>
                <th class="px-8 py-3">Actual Inflow</th>
                <th class="px-8 py-3">Actual Outflow</th>
                <th class="px-8 py-3">Projected Outflow</th>
                <th class="px-8 py-3 text-right">Net Liquidity</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-neutral-100)]">
              <tr
                v-for="row in ctrl.entries.value ?? []"
                :key="row.date"
                class="hover:bg-[var(--color-primary-50)]/30 transition-colors group"
              >
                <td class="px-8 py-3.5 text-xs font-medium text-[var(--color-neutral-700)]">
                  {{ BusinessDate.format(row.date) }}
                </td>
                <td
                  class="px-8 py-3.5 text-xs font-bold text-[var(--color-success-600)] tabular-nums"
                >
                  + {{ row.actualInflow.format() }}
                </td>
                <td
                  class="px-8 py-3.5 text-xs font-bold text-[var(--color-danger-600)] tabular-nums"
                >
                  - {{ row.actualOutflow.format() }}
                </td>
                <td
                  class="px-8 py-3.5 text-xs font-bold text-[var(--color-warning-500)] tabular-nums"
                >
                  {{ row.projectedOutflow.format() }}
                </td>
                <td
                  class="px-8 py-3.5 text-sm font-bold text-[var(--color-neutral-900)] text-right tabular-nums"
                >
                  {{ row.netCashflow.format() }}
                </td>
              </tr>
              <tr
                v-if="!ctrl.entries.value || ctrl.entries.value.length === 0"
                class="text-center py-12 text-[var(--color-neutral-400)]"
              >
                <td colspan="5" class="py-12 italic text-xs">
                  No transactional data available for the selected period.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.font-black {
  font-weight: 900;
}
</style>
