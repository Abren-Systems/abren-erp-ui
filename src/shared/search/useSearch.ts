import { ref, computed, onMounted, onUnmounted } from 'vue'
import { workspaceRegistry } from '@/platform/navigation-runtime/workspace-registry'

export interface SearchResult {
  id: string
  title: string
  category: string
  path: string
  icon?: string
}

const isPaletteOpen = ref(false)
const searchQuery = ref('')

export function useSearch() {
  const togglePalette = () => {
    isPaletteOpen.value = !isPaletteOpen.value
    if (isPaletteOpen.value) {
      searchQuery.value = ''
    }
  }

  const closePalette = () => {
    isPaletteOpen.value = false
  }

  const allItems = computed<SearchResult[]>(() => {
    const screens = workspaceRegistry.getAll().map((workspace) => ({
      id: workspace.id,
      title: workspace.titleKey,
      category: workspace.category === 'business' ? 'Business Modules' : 'System Tools',
      path: `/app/${workspace.id}`,
      icon: workspace.icon,
    }))

    // Future: Add help topics, records, etc.
    return screens
  })

  const results = computed(() => {
    if (!searchQuery.value) return []

    const query = searchQuery.value.toLowerCase()
    return allItems.value
      .filter(
        (item) =>
          item.title.toLowerCase().includes(query) || item.category.toLowerCase().includes(query),
      )
      .slice(0, 8) // Limit to top 8 high-density results
  })

  // Keyboard shortcut handler
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      togglePalette()
    }
    if (e.key === 'Escape' && isPaletteOpen.value) {
      closePalette()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    isPaletteOpen,
    searchQuery,
    results,
    togglePalette,
    closePalette,
  }
}
