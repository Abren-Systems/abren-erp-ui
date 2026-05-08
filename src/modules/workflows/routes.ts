import type { RouteRecordRaw } from 'vue-router'
import { resolveScreenRoutes } from '@/platform/screen-runtime'
import WorkspaceView from '@/platform/navigation/WorkspaceView.vue'
import { workflowScreens } from './screens'
import { workflowWorkspace } from './workspace'

export default [
  // --- Workspace (State A) ---
  {
    path: '',
    name: 'workflows-workspace',
    component: WorkspaceView,
    props: { workspace: workflowWorkspace },
  },

  // --- Screens (State B) ---
  ...resolveScreenRoutes(workflowScreens),
] satisfies RouteRecordRaw[]
