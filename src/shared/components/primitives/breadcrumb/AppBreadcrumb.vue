<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { ChevronRight, Home } from 'lucide-vue-next'

/**
 * AppBreadcrumb
 *
 * Automatically derives breadcrumbs from the current route matched components.
 * Uses the `meta.title` or route name as labels.
 */
const route = useRoute()

const breadcrumbs = computed(() => {
  const matched = route.matched
  return matched
    .filter((record) => record.meta && (record.meta.title || record.name))
    .map((record) => ({
      label: (record.meta.title as string) || (record.name as string),
      path: record.path,
      active: record.path === route.path,
    }))
})
</script>

<template>
  <fluent-breadcrumb aria-label="Breadcrumb" class="app-breadcrumb-root">
    <fluent-breadcrumb-item>
      <RouterLink to="/app" class="breadcrumb-link">
        <Home :size="14" />
      </RouterLink>
    </fluent-breadcrumb-item>

    <fluent-breadcrumb-item v-for="crumb in breadcrumbs" :key="crumb.path">
      <RouterLink v-if="!crumb.active" :to="crumb.path" class="breadcrumb-link">
        {{ crumb.label }}
      </RouterLink>
      <span v-else class="active-crumb">
        {{ crumb.label }}
      </span>
    </fluent-breadcrumb-item>
  </fluent-breadcrumb>
</template>

<style scoped>
.app-breadcrumb-root {
  /* High-density navigational styling */
  height: 24px;
  display: flex;
  align-items: center;
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--color-neutral-500);

  /* Override Fluent defaults for ERP density */
  --breadcrumb-item-spacing: 4px;
}

.breadcrumb-link {
  color: inherit;
  text-decoration: none;
  transition: color 0.1s ease;
}

.breadcrumb-link:hover {
  color: var(--color-primary-600);
}

.active-crumb {
  font-weight: 600;
  color: var(--color-neutral-900);
}
</style>
