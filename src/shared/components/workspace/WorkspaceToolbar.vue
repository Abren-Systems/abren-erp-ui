<script setup lang="ts">
 /**
 * WorkspaceToolbar.vue
 *
 * Integrated high-density toolbar for Workspaces.
 * Designed to sit at the absolute top of the DataGrid container.
 */
</script>

<template>
  <div class="flex flex-col w-full bg-white border-b border-[var(--color-neutral-100)] pt-3">
    <!-- Top Row: Global Actions -->
    <div v-if="$slots.actions" class="flex items-center gap-2 px-4 pb-2">
      <slot name="actions" />
    </div>

    <!-- Bottom Row: Tabs & Optional Grid Controls -->
    <div v-if="$slots.tabs || $slots.controls" class="flex items-end justify-between px-4">
      <div class="flex items-center gap-4">
        <slot name="tabs" />
      </div>
      <div class="flex items-center gap-2 pb-2">
        <slot name="controls" />
      </div>
    </div>
  </div>
</template>
