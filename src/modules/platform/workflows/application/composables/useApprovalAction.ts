import { useApiMutation } from '@/core/composables/useApiMutation'
import { workflowsAdapter } from '../../infrastructure/workflows_adapter'
import { eventBus } from '@/core/event-bus/event-bus'
import { useQueryClient } from '@tanstack/vue-query'

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
