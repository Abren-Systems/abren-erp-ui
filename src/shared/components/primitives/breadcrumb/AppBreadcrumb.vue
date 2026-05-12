<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'

const route = useRoute()

function formatNameFallback(name: string): string {
  if (name.includes('.')) {
    const tail = name.split('.').pop() ?? name
    return tail
      .replace(/([A-Z])/g, ' $1')
      .replace(/-/g, ' ')
      .trim()
  }
  return name.replace(/([A-Z])/g, ' $1').trim()
}

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(
    (record) => record.meta && (record.meta['title'] || record.name),
  )

  const crumbs = matched.map((record, index) => {
    const metaTitle = record.meta['title'] as string | undefined
    const name = record.name as string | undefined
    const label =
      metaTitle?.trim() || (name ? formatNameFallback(String(name)) : '') || String(record.path)

    const isLast = index === matched.length - 1
    const to: RouteLocationRaw = name ? { name } : { path: record.path || '/' }

    return {
      label,
      to,
      active: isLast,
      key: `${String(name ?? '')}-${record.path}-${index}`,
    }
  })

  return crumbs.filter((crumb, index) => {
    if (index === 0) return true
    return JSON.stringify(crumb.to) !== JSON.stringify(crumbs[index - 1]?.to)
  })
})
</script>

<template>
  <nav aria-label="Breadcrumb">
    <ol class="flex items-center gap-2 text-[13px] text-[var(--color-neutral-500)]">
      <li v-for="(crumb, index) in breadcrumbs" :key="crumb.key" class="flex items-center gap-2">
        <span v-if="index > 0" class="font-medium text-[var(--color-neutral-300)]">/</span>
        <RouterLink
          v-if="!crumb.active"
          :to="crumb.to"
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
