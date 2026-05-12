<script setup lang="ts">
import {
  BarChart3,
  BookOpen,
  Box,
  Boxes,
  Building,
  Building2,
  Calculator,
  Calendar,
  CalendarDays,
  CalendarRange,
  ChevronRight,
  CreditCard,
  FileText,
  GitBranch,
  Inbox,
  Landmark,
  LayoutGrid,
  Percent,
  RefreshCw,
  Settings,
  Shield,
  Users,
  Warehouse,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import type { WorkspaceProjection } from '@/platform/navigation-runtime/workspace-projection'
import type { WorkspaceNavigatePayload } from '@/platform/navigation/workspace-navigate.types'

const iconMap: Record<string, Component> = {
  users: Users,
  shield: Shield,
  building: Building,
  'building-2': Building2,
  'credit-card': CreditCard,
  'file-text': FileText,
  'book-open': BookOpen,
  book: BookOpen,
  calendar: Calendar,
  'calendar-days': CalendarDays,
  'calendar-range': CalendarRange,
  settings: Settings,
  inbox: Inbox,
  'git-branch': GitBranch,
  percent: Percent,
  'layout-grid': LayoutGrid,
  landmark: Landmark,
  'bar-chart-3': BarChart3,
  warehouse: Warehouse,
  boxes: Boxes,
  box: Box,
  package: Box,
  'refresh-cw': RefreshCw,
  calculator: Calculator,
}

function resolveIcon(icon?: string | Component): Component | undefined {
  if (!icon) return undefined
  if (typeof icon !== 'string') return icon
  return iconMap[icon]
}

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
          class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary-100)] text-[var(--color-primary-700)] shadow-sm"
        >
          <component :is="resolveIcon(model.icon) || LayoutGrid" class="h-6 w-6" />
        </div>
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-[var(--color-neutral-900)]">
            {{ model.titleKey }}
          </h1>
          <p class="mt-1 text-sm text-[var(--color-neutral-500)]">
            Workspace dashboard and screen access
          </p>
        </div>
      </div>
    </header>

    <!-- Tiles Grid -->
    <div
      v-if="model.tiles.length > 0"
      class="mb-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
    >
      <button
        v-for="tile in model.tiles"
        :key="tile.id"
        class="group flex flex-col items-center justify-center gap-4 rounded-2xl border border-[color:var(--color-neutral-200)] bg-[var(--app-surface)] p-6 shadow-sm transition-all hover:border-[var(--color-primary-600)] hover:shadow-md active:scale-[0.98]"
        @click="navigatePayload({ screenId: tile.screenId, routeName: tile.routeName })"
      >
        <div
          class="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-neutral-50)] text-[var(--color-neutral-600)] transition-colors group-hover:bg-[var(--color-primary-50)] group-hover:text-[var(--color-primary-600)]"
        >
          <component :is="resolveIcon(tile.icon) || Box" class="h-6 w-6" />
        </div>
        <span
          class="text-[13px] font-semibold text-center leading-tight text-[var(--color-neutral-700)] group-hover:text-[var(--color-neutral-900)]"
          >{{ tile.labelKey }}</span
        >
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
