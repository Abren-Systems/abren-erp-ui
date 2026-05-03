<script setup lang="ts">
 /**
 * WorkspaceLayout.vue
 *
 * The system standard layout for "Workspaces" (dense lists for scanning and triage).
 * Hyper-dense design: Eliminates the "Big Header" pattern and pushes the
 * operational grid directly to the top edge to maximize screen real estate.
 */
</script>

<template>
  <div class="mx-auto flex h-full w-full max-w-[1600px] flex-col px-4 py-4 sm:px-6 lg:px-8 gap-3">
    <slot name="header" />

    <!-- Operational Split-Pane -->
    <div class="flex flex-1 gap-4 overflow-hidden min-h-0">
      <!-- Main Content Area (Grid + Toolbar) -->
      <div class="flex-1 min-w-0 transition-all duration-300 ease-in-out">
        <div
          class="h-full rounded-xl border border-[var(--color-neutral-200)] bg-white shadow-sm overflow-hidden flex flex-col"
        >
          <slot />
        </div>
      </div>

      <!-- Sidebars (Filters, Trace) -->
      <slot name="sidebar" />
    </div>
  </div>
</template>
