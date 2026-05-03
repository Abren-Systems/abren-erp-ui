<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { AlertTriangle } from 'lucide-vue-next'
import { WorkspacePanel } from '@/shared/components/workspace'

interface PriorityItem {
  id: string
  title: string
  subtitle: string
  submittedAt: string
}

defineProps<{
  items: PriorityItem[]
}>()
</script>

<template>
  <WorkspacePanel
    title="Attention queue"
    description="The items below need a human decision before more work can happen."
  >
    <template #icon>
      <AlertTriangle class="h-5 w-5" />
    </template>

    <template #actions>
      <RouterLink
        :to="{ name: 'workflows.inbox' }"
        class="text-sm font-medium text-[var(--color-primary-700)] hover:text-[var(--color-primary-800)]"
      >
        View all
      </RouterLink>
    </template>

    <div v-if="items.length" class="space-y-3">
      <RouterLink
        v-for="item in items"
        :key="item.id"
        :to="{ name: 'workflows.inbox' }"
        class="flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-4 py-3 transition-colors hover:bg-white"
      >
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-[var(--color-neutral-900)]">
            {{ item.title }}
          </p>
          <p class="mt-1 text-sm text-[var(--color-neutral-600)]">{{ item.subtitle }}</p>
        </div>
        <div class="shrink-0 text-right">
          <p
            class="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-neutral-500)]"
          >
            Submitted
          </p>
          <p class="mt-1 text-sm text-[var(--color-neutral-700)]">{{ item.submittedAt }}</p>
        </div>
      </RouterLink>
    </div>

    <div
      v-else
      class="rounded-2xl border border-dashed border-[color:var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-5 py-8 text-center"
    >
      <p class="text-sm font-semibold text-[var(--color-neutral-900)]">
        No approvals are waiting right now.
      </p>
      <p class="mt-2 text-sm text-[var(--color-neutral-600)]">
        When workflow tasks arrive, this queue becomes the fastest way to clear them.
      </p>
    </div>
  </WorkspacePanel>
</template>
