import type { RouteRecordRaw } from 'vue-router'
import { resolveScreenRoutes } from '@/platform/screen-runtime'
import WorkspaceView from '@/platform/navigation/WorkspaceView.vue'
import { inventoryScreens } from './screens'
import { inventoryWorkspace } from './workspace'

export default [
  // --- Workspace (State A) ---
  {
    path: '',
    name: 'inventory-workspace',
    component: WorkspaceView,
    props: { workspace: inventoryWorkspace },
  },

  // --- Screens (State B) ---
  ...resolveScreenRoutes(inventoryScreens),
] satisfies RouteRecordRaw[]
