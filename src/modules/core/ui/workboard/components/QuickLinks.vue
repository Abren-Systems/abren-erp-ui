<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { CheckCircle2, ArrowRight } from 'lucide-vue-next'
import { WorkspacePanel } from '@/shared/components/workspace'

interface QuickLink {
  title: string
  description: string
  to: unknown
}

defineProps<{
  links: QuickLink[]
}>()
</script>

<template>
  <WorkspacePanel
    title="Jump into work"
    description="Shortcuts into the parts of the system that drive real execution."
  >
    <template #icon>
      <CheckCircle2 class="h-5 w-5" />
    </template>

    <div class="grid gap-3 sm:grid-cols-2">
      <RouterLink
        v-for="link in links"
        :key="link.title"
        :to="link.to"
        class="group rounded-2xl border border-[color:var(--color-neutral-200)] bg-[linear-gradient(180deg,#ffffff,rgba(248,250,252,0.88))] p-4 transition-transform hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)]"
      >
        <p class="text-sm font-semibold text-[var(--color-neutral-900)]">{{ link.title }}</p>
        <p class="mt-2 text-sm leading-6 text-[var(--color-neutral-600)]">
          {{ link.description }}
        </p>
        <div
          class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary-700)]"
        >
          Open
          <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </RouterLink>
    </div>
  </WorkspacePanel>
</template>
