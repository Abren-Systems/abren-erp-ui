<script setup lang="ts">
import type { WorkspaceProjection } from '@/platform/navigation-runtime/workspace-projection'
import type { WorkspaceNavigatePayload } from '@/platform/navigation/workspace-navigate.types'

defineProps<{
  /**
   * Pure projection model.
   * The renderer has zero business logic and does not access router state.
   */
  model: WorkspaceProjection
}>()

const emit = defineEmits<{
  (e: 'navigate', payload: WorkspaceNavigatePayload): void
}>()

function navigatePayload(p: WorkspaceNavigatePayload) {
  emit('navigate', p)
}
</script>

<template>
  <div class="workspace-renderer w-full min-w-0">
    <!-- NAI-05: We do not use RouterLink directly here. Navigation is handled by the parent/container -->

    <!-- Title Bar -->
    <header class="mb-8 border-b border-[color:var(--color-neutral-200)] pb-6">
      <div class="flex items-center gap-4">
        <div
          class="flex h-10 w-10 items-center justify-center rounded bg-[var(--color-primary-100)] text-xl font-bold text-[var(--color-primary-700)]"
        >
          {{ model.icon }}
        </div>
        <div>
          <h1 class="text-2xl font-semibold tracking-tight text-[var(--color-neutral-900)]">
            {{ model.titleKey }}
          </h1>
          <p class="mt-1 text-sm text-[var(--color-neutral-500)]">Choose a screen to open</p>
        </div>
      </div>
    </header>

    <!-- Tiles Grid -->
    <div
      v-if="model.tiles.length > 0"
      class="mb-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
    >
      <button
        v-for="tile in model.tiles"
        :key="tile.id"
        class="flex flex-col items-center justify-center gap-3 rounded-xl border border-[color:var(--color-neutral-200)] bg-white p-6 shadow-sm transition-all hover:border-[color:var(--color-primary-300)] hover:text-[var(--color-primary-700)] hover:shadow-md text-[var(--color-neutral-700)]"
        @click="navigatePayload({ screenId: tile.screenId, routeName: tile.routeName })"
      >
        <span class="text-3xl">{{ tile.icon }}</span>
        <span class="text-sm font-medium text-center leading-tight">{{ tile.labelKey }}</span>
      </button>
    </div>

    <!-- Categories Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      <div v-for="category in model.categories" :key="category.id" class="flex flex-col">
        <h2
          class="mb-4 border-b border-[color:var(--color-neutral-200)] pb-2 text-base font-semibold text-[var(--color-neutral-900)]"
        >
          {{ category.labelKey }}
        </h2>
        <ul class="flex flex-col gap-2">
          <li v-for="link in category.links" :key="link.id">
            <button
              type="button"
              class="text-left text-sm text-[var(--color-neutral-600)] underline-offset-2 hover:text-[var(--color-primary-600)] hover:underline"
              @click="navigatePayload({ screenId: link.screenId, routeName: link.routeName })"
            >
              {{ link.labelKey }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
