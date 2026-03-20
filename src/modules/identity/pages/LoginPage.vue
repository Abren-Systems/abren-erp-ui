<script setup lang="ts">
/**
 * Login Page — Identity Module
 * Stub implementation for scaffolding.
 */
</script>

<template>
  <div class="rounded-xl bg-white p-8 shadow-lg">
    <h1 class="text-2xl font-bold text-surface-900 mb-6">
      Sign in to Abren ERP
    </h1>
    <form
      class="space-y-4"
      @submit.prevent
    >
      <div>
        <label
          for="email"
          class="block text-sm font-medium text-surface-700 mb-1"
        >Email</label>
        <input
          id="email"
          type="email"
          class="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          placeholder="you@company.com"
        >
      </div>
      <div>
        <label
          for="password"
          class="block text-sm font-medium text-surface-700 mb-1"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          class="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          placeholder="••••••••"
        >
      </div>
      <button
        type="submit"
        class="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
      >
        Sign in
      </button>
    </form>
  </div>
</template>
