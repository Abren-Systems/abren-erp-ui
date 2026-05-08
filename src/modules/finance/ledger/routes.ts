import type { RouteRecordRaw } from 'vue-router'
import { resolveScreenRoutes } from '@/platform/screen-runtime'
import WorkspaceView from '@/platform/navigation/WorkspaceView.vue'
import { ledgerScreens } from './screens'
import { ledgerWorkspace } from './workspace'

export default [
  // --- Workspace (State A) ---
  {
    path: '',
    name: 'ledger-workspace',
    component: WorkspaceView,
    props: { workspace: ledgerWorkspace },
  },

  // --- Screens (State B) ---
  ...resolveScreenRoutes(ledgerScreens),
] satisfies RouteRecordRaw[]
