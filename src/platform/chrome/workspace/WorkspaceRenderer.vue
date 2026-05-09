<script setup lang="ts">
import type { WorkspaceModel } from '@/platform/navigation-runtime/workspace-model'

defineProps<{
  /**
   * Pure projection model.
   * The renderer has zero business logic and does not access router state.
   */
  model: WorkspaceModel
}>()

const emit = defineEmits<{
  (e: 'navigate', screenId: string): void
}>()
</script>

<template>
  <div class="workspace-renderer max-w-[1600px] mx-auto px-4 py-6 sm:px-6 lg:px-8">
    <!-- NAI-05: We do not use RouterLink directly here. Navigation is handled by the parent/container -->

    <!-- Title Bar -->
    <header class="mb-8 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <!-- Module Icon Placeholder -->
        <div
          class="w-10 h-10 rounded bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xl"
        >
          {{ model.icon }}
        </div>
        <h1 class="text-2xl font-semibold text-neutral-900 tracking-tight">{{ model.titleKey }}</h1>
      </div>
      <div class="flex items-center gap-4">
        <!-- Search placeholder -->
        <div class="relative w-64">
          <input
            type="text"
            placeholder="Search in Workspace..."
            class="w-full h-9 rounded-md border border-neutral-300 pl-3 pr-4 text-sm"
            disabled
          />
        </div>
        <button class="text-sm font-medium text-primary-600 hover:text-primary-700">
          Show All
        </button>
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
        class="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-neutral-200 rounded-xl shadow-sm hover:shadow-md hover:border-primary-300 transition-all text-neutral-700 hover:text-primary-700"
        @click="emit('navigate', tile.screenId)"
      >
        <span class="text-3xl">{{ tile.icon }}</span>
        <span class="text-sm font-medium text-center leading-tight">{{ tile.labelKey }}</span>
      </button>
    </div>

    <!-- Categories Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      <div v-for="category in model.categories" :key="category.id" class="flex flex-col">
        <h2 class="text-base font-semibold text-neutral-900 mb-4 border-b border-neutral-200 pb-2">
          {{ category.labelKey }}
        </h2>
        <ul class="flex flex-col gap-2">
          <li v-for="link in category.links" :key="link.id">
            <button
              class="text-sm text-neutral-600 hover:text-primary-600 hover:underline text-left"
              @click="emit('navigate', link.screenId)"
            >
              {{ link.labelKey }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
