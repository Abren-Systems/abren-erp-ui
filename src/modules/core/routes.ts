import type { RouteRecordRaw } from 'vue-router'
import { resolveScreenRoutes } from '@/platform/screen-runtime'
import WorkspaceView from '@/platform/navigation/WorkspaceView.vue'
import { coreScreens } from './screens'
import { coreWorkspace } from './workspace'

export default [
  // --- Workspace (State A) ---
  {
    path: '',
    name: 'core-workspace',
    component: WorkspaceView,
    props: { workspace: coreWorkspace },
  },

  // --- Screens (State B) ---
  ...resolveScreenRoutes(coreScreens),
] satisfies RouteRecordRaw[]
