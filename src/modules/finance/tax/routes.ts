import type { RouteRecordRaw } from 'vue-router'
import { resolveScreenRoutes } from '@/platform/screen-runtime'
import WorkspaceView from '@/platform/navigation/WorkspaceView.vue'
import { taxScreens } from './screens'
import { taxWorkspace } from './workspace'

export default [
  // --- Workspace (State A) ---
  {
    path: '',
    name: 'tax-workspace',
    component: WorkspaceView,
    props: { workspace: taxWorkspace },
  },

  // --- Screens (State B) ---
  ...resolveScreenRoutes(taxScreens),
] satisfies RouteRecordRaw[]
