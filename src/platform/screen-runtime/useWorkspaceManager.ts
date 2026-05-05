import { shallowRef, ref, computed } from 'vue'
import type { ScreenInstance } from './screen-instance.types'

/**
 * Workspace Manager
 *
 * Enforces the stateful ScreenInstance paradigm.
 * Instead of relying on Vue Router to mount/unmount components (destroying state),
 * the Workspace Manager keeps track of open screen instances.
 */
const openScreens = shallowRef<ScreenInstance[]>([])
const activeScreenInstanceId = ref<string | null>(null)

export function useWorkspaceManager() {
  const activeScreen = computed(() =>
    openScreens.value.find((s) => s.instanceId === activeScreenInstanceId.value),
  )

  function activateScreen(instance: ScreenInstance) {
    const existing = openScreens.value.find((s) => s.instanceId === instance.instanceId)
    if (!existing) {
      openScreens.value = [...openScreens.value, instance]
    } else {
      existing.lastAccessedAt = new Date().toISOString()
      openScreens.value = [...openScreens.value] // Trigger reactivity
    }
    activeScreenInstanceId.value = instance.instanceId
  }

  function closeScreen(instanceId: string) {
    const index = openScreens.value.findIndex((s) => s.instanceId === instanceId)
    if (index > -1) {
      const newScreens = [...openScreens.value]
      newScreens.splice(index, 1)
      openScreens.value = newScreens

      if (activeScreenInstanceId.value === instanceId) {
        // Fallback to the last opened screen, or null
        activeScreenInstanceId.value =
          newScreens.length > 0 ? (newScreens[newScreens.length - 1]?.instanceId ?? null) : null
      }
    }
  }

  return {
    openScreens,
    activeScreenInstanceId,
    activeScreen,
    activateScreen,
    closeScreen,
  }
}
