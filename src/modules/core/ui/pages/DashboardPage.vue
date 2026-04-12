<script setup lang="ts">
import { useAuditStore } from '@/shared/infrastructure/audit.store'
import { storeToRefs } from 'pinia'
import GlobalActivityFeed from '../components/GlobalActivityFeed.vue'
import { Activity, DollarSign, TrendingUp, Users } from 'lucide-vue-next'
import { useUsers } from '../../application/composables/useUsers'
import { computed } from 'vue'

const auditStore = useAuditStore()
const { totalLogs } = storeToRefs(auditStore)

const { users, isPending: isLoadingUsers } = useUsers()
const activeUsersCount = computed(() => users.value?.length ?? 0)
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-neutral-900 tracking-tight">Dashboard</h1>
        <p class="text-neutral-500 mt-1">Real-time financial visibility & system monitoring.</p>
      </div>
      <div
        class="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-neutral-200 shadow-sm"
      >
        <div class="w-2 h-2 rounded-full bg-success-500 animate-pulse"></div>
        <span class="text-xs font-semibold text-neutral-600 uppercase tracking-wider"
          >System Live</span
        >
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div
        class="p-6 bg-white rounded-xl border border-neutral-200 shadow-sm transition-all hover:shadow-md"
      >
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm font-medium text-neutral-500">System Activity</p>
          <Activity class="w-4 h-4 text-indigo-500" />
        </div>
        <p class="text-3xl font-bold text-neutral-900">{{ totalLogs }}</p>
        <p class="mt-1 text-xs text-indigo-500 font-semibold tracking-wide uppercase">
          Hardened Events
        </p>
      </div>

      <div
        class="p-6 bg-white rounded-xl border border-neutral-200 shadow-sm transition-all hover:shadow-md"
      >
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm font-medium text-neutral-500">Total Revenue</p>
          <DollarSign class="w-4 h-4 text-success-500" />
        </div>
        <p class="text-3xl font-bold text-neutral-900">$45,231</p>
        <p class="mt-1 text-xs text-success-500 font-semibold tracking-wide uppercase">
          +20.1% growth
        </p>
      </div>

      <div
        class="p-6 bg-white rounded-xl border border-neutral-200 shadow-sm transition-all hover:shadow-md"
      >
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm font-medium text-neutral-500">Active Users</p>
          <Users class="w-4 h-4 text-blue-500" />
        </div>
        <div v-if="isLoadingUsers" class="h-9 w-12 bg-neutral-100 animate-pulse rounded"></div>
        <p v-else class="text-3xl font-bold text-neutral-900">{{ activeUsersCount }}</p>
        <p class="mt-1 text-xs text-blue-500 font-semibold tracking-wide uppercase">
          Across Current Tenant
        </p>
      </div>

      <div
        class="p-6 bg-white rounded-xl border border-neutral-200 shadow-sm transition-all hover:shadow-md"
      >
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm font-medium text-neutral-500">Processing Speed</p>
          <TrendingUp class="w-4 h-4 text-emerald-500" />
        </div>
        <p class="text-3xl font-bold text-neutral-900">140ms</p>
        <p class="mt-1 text-xs text-emerald-500 font-semibold tracking-wide uppercase">
          Avg latency
        </p>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
      <!-- Activity Feed -->
      <div class="p-6 bg-white rounded-xl border border-neutral-200 shadow-sm h-[500px]">
        <GlobalActivityFeed />
      </div>

      <!-- Secondary Metrics -->
      <div class="p-6 bg-white rounded-xl border border-neutral-200 shadow-sm h-[500px]">
        <h3 class="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <TrendingUp class="w-5 h-5 text-neutral-400" />
          Cashflow Analysis
        </h3>
        <div
          class="flex flex-col items-center justify-center h-full text-neutral-400 italic space-y-4"
        >
          <div
            class="w-full h-48 bg-neutral-50 rounded-lg border border-dashed border-neutral-200 flex items-center justify-center"
          >
            Chart Placeholder
          </div>
          <p class="text-sm">Consolidated financial charts will appear here.</p>
        </div>
      </div>
    </div>
  </div>
</template>
