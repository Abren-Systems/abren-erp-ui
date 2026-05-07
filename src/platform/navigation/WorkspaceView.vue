<script setup lang="ts">
/**
 * WorkspaceView.vue
 *
 * The Acumatica-style State A "Workspace" view. This is a navigation surface,
 * not a transactional form. It displays tiles (quick actions) and categorized
 * lists of links to reach specific screen runtimes (State B).
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Star } from 'lucide-vue-next'
import WorkspaceCategoryPanel from '@/shared/components/workspace/WorkspaceCategoryPanel.vue'
import type { WorkspaceContract, NavigationLinkContract } from './navigation.contract'

const props = defineProps<{
  /** The full structure of this module's workspace */
  workspace: WorkspaceContract
}>()

const router = useRouter()

function navigateToLink(link: NavigationLinkContract) {
  if (link.screenId) {
    // Determine the module from the current route or workspace structure.
    // Assuming current route is /:module (e.g. /ap)
    const currentModule = router.currentRoute.value.path.split('/')[1] || 'core'
    void router.push(`/${currentModule}/screens/${link.screenId}`)
  } else if (link.externalUrl) {
    window.open(link.externalUrl, '_blank')
  }
}
</script>

<template>
  <div class="workspace-view">
    <!-- Header -->
    <header class="workspace-view__header">
      <h1 class="workspace-view__title">{{ workspace.titleKey }}</h1>
    </header>

    <!-- Tiles (Quick Actions) -->
    <div v-if="workspace.tiles.length > 0" class="workspace-view__tiles">
      <!-- TODO: Implement WorkspaceTile component when needed. 
           For now, we just map out the container. -->
    </div>

    <!-- Category Panels Grid -->
    <div class="workspace-view__grid">
      <WorkspaceCategoryPanel
        v-for="category in workspace.categories"
        :key="category.id"
        :title="category.labelKey"
      >
        <ul class="workspace-category-list">
          <li
            v-for="link in category.links"
            :key="link.id"
            class="workspace-category-list__item"
          >
            <button
              class="workspace-category-list__link"
              @click="navigateToLink(link)"
            >
              {{ link.labelKey }}
            </button>
            <div class="workspace-category-list__affordance" title="Add to favorites">
              <Star :size="14" />
            </div>
          </li>
        </ul>
      </WorkspaceCategoryPanel>
    </div>
  </div>
</template>

<style scoped>
.workspace-view {
  display: flex;
  flex-direction: column;
  padding: 2rem;
  gap: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

.workspace-view__header {
  border-bottom: 1px solid var(--color-neutral-200);
  padding-bottom: 1rem;
}

.workspace-view__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-neutral-900);
}

.workspace-view__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  align-items: start;
}

.workspace-category-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.workspace-category-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.375rem 0.5rem;
  margin: 0 -0.5rem;
  border-radius: 0.375rem;
  transition: background-color 0.15s ease;
}

.workspace-category-list__item:hover {
  background-color: var(--color-neutral-50);
}

.workspace-category-list__link {
  background: transparent;
  border: none;
  color: var(--color-primary-600);
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0;
  text-align: left;
  flex: 1;
}

.workspace-category-list__link:hover {
  text-decoration: underline;
}

.workspace-category-list__affordance {
  color: var(--color-neutral-300);
  opacity: 0;
  transition: opacity 0.15s ease, color 0.15s ease;
  cursor: pointer;
}

.workspace-category-list__item:hover .workspace-category-list__affordance {
  opacity: 1;
}

.workspace-category-list__affordance:hover {
  color: var(--color-warning-500);
}
</style>
