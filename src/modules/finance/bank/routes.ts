import type { RouteRecordRaw } from 'vue-router'
import { resolveScreenRoutes } from '@/platform/screen-runtime'
import WorkspaceView from '@/platform/navigation/WorkspaceView.vue'
import { bankScreens } from './screens'
import { bankWorkspace } from './workspace'

export default [
  // --- Workspace (State A) ---
  {
    path: '',
    name: 'bank-workspace',
    component: WorkspaceView,
    props: { workspace: bankWorkspace },
  },

  // --- Screens (State B) ---
  ...resolveScreenRoutes(bankScreens),
] satisfies RouteRecordRaw[]
