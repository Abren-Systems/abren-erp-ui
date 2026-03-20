<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-surface-50 flex">
    <!-- Sidebar placeholder -->
    <aside class="w-64 bg-surface-900 text-white p-4 hidden lg:block">
      <div class="text-xl font-bold mb-8">
        Abren ERP
      </div>
      <nav class="space-y-2">
        <RouterLink
          to="/app"
          class="block px-3 py-2 rounded-md hover:bg-surface-700 transition-colors"
        >
          Dashboard
        </RouterLink>
        <!-- Module nav links will be added here -->
      </nav>
    </aside>

    <!-- Main content -->
    <main class="flex-1 p-6">
      <RouterView />
    </main>
  </div>
</template>
