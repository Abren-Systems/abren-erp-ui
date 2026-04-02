import { useApiMutation } from '@/shared/composables/useApiMutation'
import { workflowsAdapter } from '../../infrastructure/workflows_adapter'
import { eventBus } from '@/shared/event-bus/event-bus'
import { useQueryClient } from '@tanstack/vue-query'

/**
 * Use Case: Submit a Workflow Approval Decision.
 *
 * Provides a mutation for approving or rejecting a pending workflow task,
 * including business justification/comments.
 *
 * @returns TanStack Mutation instance for the approval operation.
 * @example
 * const { mutate: approve, isPending } = useApprovalAction()
 * approve({ instanceId: '123', action: 'APPROVE', comments: 'Approved' })
 */
export function useApprovalAction() {
  const queryClient = useQueryClient()

  return useApiMutation(
    async ({
      instanceId,
      action,
      comments,
    }: {
      instanceId: string
      action: 'APPROVE' | 'REJECT'
      comments: string
    }) => {
      await workflowsAdapter.submitDecision(instanceId, { action, comments })
    },
    {
      onSuccess: () => {
        // Invalidate the task list
        void queryClient.invalidateQueries({ queryKey: ['workflow-pending-tasks'] })

        // Emit global event for other modules
        eventBus.emit('workflow:action-completed', {})
      },
    },
  )
}
