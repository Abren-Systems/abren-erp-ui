import { useWorkflowInboxController } from './controller'
import type { ScreenDefinition } from '@/platform/screen-runtime'
import { createScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ModuleId } from '@/shared/types/brand.types'
import { EP503010_COMMANDS } from './commands'

/**
 * EP503010 - Approvals
 */
export const EP503010: ScreenDefinition = {
  id: createScreenId('EP503010'),
  moduleId: 'workflows' as ModuleId,
  controller: () => useWorkflowInboxController(),
  kind: 'processing',
  titleKey: 'Approvals',
  primaryView: 'inbox',
  route: {
    path: 'approvals',
    name: 'EPApprovals',
  },
  permissions: [{ key: 'workflows.inbox.view', description: 'View workflow inbox' }],
  layout: {
    summaryTemplate: '1',
    renderTarget: () => import('./view.vue') as never,
  },
  views: {
    inbox: {
      name: 'inbox',
      kind: 'collection',
      containerName: 'WorkflowInbox',
      queryKey: ['workflows', 'inbox'] as const,
    },
  },
  commands: Object.values(EP503010_COMMANDS),
  personalization: {
    allowTabPersonalization: false,
    allowGridPersonalization: true,
    allowFilterSaving: true,
    allowSectionPersonalization: false,
  },
  test: {
    containerName: 'WorkflowInboxScreen',
    viewNames: ['InboxGrid'],
    actionNames: ['Approve', 'Reject', 'Delegate'],
  },
}
