<script setup lang="ts">
 /**
 * WorkspaceLayout.vue
 *
 * The system standard layout container for "Workspaces" (dense lists for scanning and triage).
 * The Workspace is ONLY a container. It provides:
 * - Page-level padding and max-width
 * - A header slot for PageHeader
 * - A sidebar slot for docked panes
 *
 * All filter/toolbar/footer concerns belong to the Grid, not the Workspace.
 */
</script>

<template>
  <div class="mx-auto flex h-full w-full max-w-[1600px] flex-col px-4 py-4 sm:px-6 lg:px-8 gap-3">
    <slot name="header" />

    <!-- Operational Split-Pane -->
    <div class="flex flex-1 gap-4 overflow-hidden min-h-0">
      <!-- Main Content Area -->
      <div class="flex-1 min-w-0 flex flex-col overflow-hidden">
        <slot />
      </div>

      <!-- Sidebars (Filters, Trace) -->
      <slot name="sidebar" />
    </div>
  </div>
</template>
