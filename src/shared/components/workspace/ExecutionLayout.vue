<script setup lang="ts">
 /**
 * ExecutionLayout.vue
 *
 * The system standard layout for "Macro-Forms" and decision environments.
 * It strictly enforces the 2-column model: Execution Surface (left) + Financial Summary (right).
 * It manages responsive behaviors (mobile top-strip) and absolute sticky states (action bar).
 */
</script>

<template>
  <div class="flex h-full flex-col bg-neutral-50/50 relative">
    <!-- 1. Header (Context Identity) -->
    <slot name="header" />

    <!-- 2. Mobile Responsive Summary (Visible < xl) -->
    <div
      class="xl:hidden sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-sm p-4 flex justify-between items-center"
    >
      <slot name="mobile-summary" />
    </div>

    <!-- 3. Main Grid -->
    <div class="flex-1 overflow-y-auto p-6 scrollbar-thin pb-24">
      <div class="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">
        <!-- Left: Execution Surface -->
        <div class="space-y-6 flex-1 min-w-0">
          <slot />
        </div>

        <!-- Right: Financial Intelligence (Sticky) -->
        <aside class="hidden xl:block sticky top-6">
          <slot name="panel" />
        </aside>
      </div>
    </div>

    <!-- 4. Global Action Bar -->
    <div
      class="fixed bottom-0 left-0 right-0 border-t border-neutral-200 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 flex items-center justify-between"
    >
      <div class="text-xs flex items-center gap-2 px-4 max-w-7xl mx-auto w-full">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
