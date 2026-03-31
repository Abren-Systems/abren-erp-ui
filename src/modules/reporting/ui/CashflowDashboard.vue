<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { reportingAdapter, type DailyCashflowDTO } from '../infrastructure/reporting_adapter'
import ReportingChart from './ReportingChart.vue'
import { TrendingUp, TrendingDown, Clock, Wallet, LayoutDashboard } from 'lucide-vue-next'

const cashflowData = ref<DailyCashflowDTO[]>([])
const loading = ref(true)

// Date Range (Last 30 days)
const endDate = new Date().toISOString().split('T')[0]!
const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!

onMounted(async () => {
  try {
    const data = await reportingAdapter.getDailyCashflow({ startDate, endDate })
    cashflowData.value = data
  } catch (error) {
    console.error('Failed to load cashflow data:', error)
  } finally {
    loading.value = false
  }
})

const stats = ref([
  {
    name: 'Total Actual Inflow',
    value: '42.5M',
    icon: TrendingUp,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    name: 'Total Actual Outflow',
    value: '18.2M',
    icon: TrendingDown,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
  {
    name: 'Projected Exposure',
    value: '12.4M',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    name: 'Net Cash Position',
    value: '24.3M',
    icon: Wallet,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
])
</script>

<template>
  <div
    class="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700"
  >
    <!-- Header -->
    <header
      class="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100"
    >
      <div>
        <h1 class="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <LayoutDashboard class="w-8 h-8 text-blue-600" />
          Financial Insights
        </h1>
        <p class="text-slate-500 mt-2 text-lg">Real-time dual-layer cashflow reporting.</p>
      </div>

      <div
        class="flex items-center gap-3 p-1 rounded-xl bg-slate-100/50 border border-slate-200 shadow-inner"
      >
        <button
          class="px-6 py-2 rounded-lg bg-white text-slate-800 font-semibold shadow-sm transition-all hover:bg-white/80 active:scale-95"
        >
          Daily
        </button>
        <button
          class="px-6 py-2 rounded-lg text-slate-500 font-medium transition-all hover:bg-slate-200"
        >
          Weekly
        </button>
        <button
          class="px-6 py-2 rounded-lg text-slate-500 font-medium transition-all hover:bg-slate-200"
        >
          Monthly
        </button>
      </div>
    </header>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="stat in stats"
        :key="stat.name"
        class="group relative p-6 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden"
      >
        <div class="flex items-center gap-5">
          <div
            :class="[
              stat.bg,
              'p-4 rounded-xl transition-colors group-hover:bg-opacity-80 shadow-inner',
            ]"
          >
            <component :is="stat.icon" :class="[stat.color, 'w-8 h-8']" />
          </div>
          <div>
            <p class="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              {{ stat.name }}
            </p>
            <p class="text-2xl font-black text-slate-900 mt-1 tracking-tighter">{{ stat.value }}</p>
          </div>
        </div>
        <!-- Decorative background element -->
        <div
          class="absolute -right-4 -bottom-4 opacity-10 blur-xl transition-all group-hover:scale-125"
        >
          <component :is="stat.icon" class="w-24 h-24" />
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <ReportingChart
        title="Cash Inflow: Actual vs Committed"
        :data="
          cashflowData.map((d) => ({
            date: d.date,
            actual: d.total_inflow,
            projected: d.projected_inflow,
          }))
        "
      />
      <ReportingChart
        title="Cash Outflow: Actual vs Committed"
        :data="
          cashflowData.map((d) => ({
            date: d.date,
            actual: d.total_outflow,
            projected: d.projected_outflow,
          }))
        "
      />
    </div>

    <!-- Detailed Table Section -->
    <section class="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div
        class="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between"
      >
        <h2 class="text-xl font-bold text-slate-800">Transactional History</h2>
        <button
          class="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors px-4 py-2 hover:bg-blue-50 rounded-lg"
        >
          Export Report
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr
              class="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-widest border-b border-slate-100"
            >
              <th class="px-8 py-4">Date</th>
              <th class="px-8 py-4">Actual Inflow</th>
              <th class="px-8 py-4">Actual Outflow</th>
              <th class="px-8 py-4">Projected Outflow</th>
              <th class="px-8 py-4 text-right">Net Liquidity</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="row in cashflowData"
              :key="row.date"
              class="hover:bg-blue-50/30 transition-colors"
            >
              <td class="px-8 py-5 text-sm font-medium text-slate-700">{{ row.date }}</td>
              <td class="px-8 py-5 text-sm font-semibold text-emerald-600">
                + {{ row.total_inflow }}
              </td>
              <td class="px-8 py-5 text-sm font-semibold text-rose-600">
                - {{ row.total_outflow }}
              </td>
              <td class="px-8 py-5 text-sm font-semibold text-amber-500">
                {{ row.projected_outflow }}
              </td>
              <td class="px-8 py-5 text-sm font-black text-slate-900 text-right">
                {{ row.net_cashflow }} {{ row.currency_code }}
              </td>
            </tr>
            <tr v-if="cashflowData.length === 0" class="text-center py-20 text-slate-400">
              <td colspan="5" class="py-20 italic">
                No transactional data available for the selected period.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.font-black {
  font-weight: 900;
}
</style>
