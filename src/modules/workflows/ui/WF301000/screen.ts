import type { ScreenDefinition } from '@/platform/screen-runtime'
import type { ScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ModuleId } from '@/shared/types/brand.types'
import { WF301000_COMMANDS } from './commands'

/**
 * WF301000 - Workflow Inbox
 * Architecture Note: This is a cross-cutting action dispatcher.
 * It is NOT a standard domain state owner.
 */
export const WF301000: ScreenDefinition = {
  id: 'WF301000' as ScreenId,
  moduleId: 'workflows' as ModuleId,
  kind: 'processing', // Modeled as processing/workboard dispatcher
  titleKey: 'Workflow Inbox',
  primaryView: 'inbox',
  route: {
    path: '/workflows/inbox',
    name: 'WorkflowInbox',
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
  commands: Object.values(WF301000_COMMANDS),
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
