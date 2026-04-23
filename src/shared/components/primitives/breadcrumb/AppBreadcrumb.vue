<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ChevronRight, Home } from 'lucide-vue-next'

const route = useRoute()

const breadcrumbs = computed(() => {
  const crumbs = route.matched
    .filter((record) => record.meta && (record.meta['title'] || record.name))
    .map((record) => {
      const label = (record.meta['title'] as string) || (record.name as string)
      return {
        label: label.replace(/([A-Z])/g, ' $1').trim(),
        path: record.path,
        active: record.path === route.path,
      }
    })

  // Remove redundant crumbs with identical paths (common with nested index routes)
  return crumbs.filter((crumb, index) => {
    return index === 0 || crumb.path !== crumbs[index - 1]?.path
  })
})
</script>

<template>
  <nav aria-label="Breadcrumb">
    <ol class="flex items-center gap-2 text-[13px] text-[var(--color-neutral-500)]">
      <li class="flex items-center gap-2">
        <RouterLink
          to="/app"
          class="inline-flex items-center text-[var(--color-neutral-500)] transition-colors hover:text-[var(--color-primary-600)]"
        >
          <Home :size="14" />
        </RouterLink>
      </li>

      <li v-for="crumb in breadcrumbs" :key="crumb.path" class="flex items-center gap-2">
        <ChevronRight :size="14" class="text-[var(--color-neutral-400)]" />
        <RouterLink
          v-if="!crumb.active"
          :to="crumb.path"
          class="transition-colors hover:text-[var(--color-primary-600)]"
        >
          {{ crumb.label }}
        </RouterLink>
        <span v-else class="font-semibold text-[var(--color-neutral-900)]">
          {{ crumb.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>
