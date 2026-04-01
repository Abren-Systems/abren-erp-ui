<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-neutral-900">Dashboard</h1>
      <p class="text-neutral-500">Welcome back to your financial control center.</p>
    </div>

    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Stats Cards -->
      <div
        v-for="i in 4"
        :key="i"
        class="p-6 bg-white rounded-xl border border-neutral-200 shadow-sm"
      >
        <p class="text-sm font-medium text-neutral-500">Total Revenue</p>
        <p class="mt-2 text-3xl font-bold text-neutral-900">$45,231.89</p>
        <p class="mt-1 text-xs text-success-500">+20.1% from last month</p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div class="p-6 bg-white rounded-xl border border-neutral-200 shadow-sm min-h-[300px]">
        <h3 class="text-lg font-semibold text-neutral-900 mb-4">Recent Transactions</h3>
        <div class="flex items-center justify-center h-full text-neutral-400 italic">
          No data available.
        </div>
      </div>
      <div class="p-6 bg-white rounded-xl border border-neutral-200 shadow-sm min-h-[300px]">
        <h3 class="text-lg font-semibold text-neutral-900 mb-4">Cashflow</h3>
        <div class="flex items-center justify-center h-full text-neutral-400 italic">
          Chart placeholder.
        </div>
      </div>
    </div>
  </div>
</template>
