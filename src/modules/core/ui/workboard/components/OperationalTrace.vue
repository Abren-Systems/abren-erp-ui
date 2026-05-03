<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'
import { WorkspacePanel } from '@/shared/components/workspace'

interface TraceEvent {
  id: string
  title: string
  sourceModule: string
  timestamp: string
}

defineProps<{
  totalLogs: number
  events: TraceEvent[]
}>()
</script>

<template>
  <WorkspacePanel
    title="Recent operational trace"
    description="Visible history builds trust. Nothing important should feel untraceable."
  >
    <template #icon>
      <Sparkles class="h-5 w-5" />
    </template>

    <template #actions>
      <span class="text-sm text-[var(--color-neutral-500)]">{{ totalLogs }} total events</span>
    </template>

    <div v-if="events.length" class="space-y-3">
      <div
        v-for="event in events"
        :key="event.id"
        class="flex items-start justify-between gap-4 rounded-2xl border border-[color:var(--color-neutral-200)] px-4 py-3"
      >
        <div class="min-w-0">
          <p class="text-sm font-semibold text-[var(--color-neutral-900)]">{{ event.title }}</p>
          <p class="mt-1 text-sm text-[var(--color-neutral-600)]">
            {{ event.sourceModule }} module
          </p>
        </div>
        <p class="shrink-0 text-sm text-[var(--color-neutral-500)]">{{ event.timestamp }}</p>
      </div>
    </div>

    <div
      v-else
      class="rounded-2xl border border-dashed border-[color:var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-5 py-8 text-center"
    >
      <p class="text-sm font-semibold text-[var(--color-neutral-900)]">
        No operational events captured yet.
      </p>
      <p class="mt-2 text-sm text-[var(--color-neutral-600)]">
        The workboard stays honest: it will show activity when real events are flowing.
      </p>
    </div>
  </WorkspacePanel>
</template>
