import type { RouteRecordRaw } from 'vue-router'
import { resolveScreenRoutes } from '@/platform/screen-runtime'
import WorkspaceView from '@/platform/navigation/WorkspaceView.vue'
import { apScreens } from './screens'
import { apWorkspace } from './workspace'

export default [
  // --- Workspace (State A) ---
  {
    path: '',
    name: 'ap-workspace',
    component: WorkspaceView,
    props: { workspace: apWorkspace },
  },

  // --- Screens (State B) ---
  ...resolveScreenRoutes(apScreens),
] satisfies RouteRecordRaw[]
