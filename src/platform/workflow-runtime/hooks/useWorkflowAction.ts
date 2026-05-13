import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { ActionDescriptor, OperationalEntity } from '../models/workflows.types'
import { useNotifications } from '@/shared/composables/useNotifications'
import { useDialogs } from '@/shared/composables/useDialogs'

export interface WorkflowActionConfig<T> {
  id: string
  version: number
  execute: (
    id: string,
    action: string,
    version: number,
    payload?: Record<string, unknown>,
  ) => Promise<OperationalEntity<T>>
  queryKey: unknown[]
  onSuccess?: (data: OperationalEntity<T>) => void
}

/**
 * Universal hook for executing Workflow Actions based on backend projections.
 * Handles confirmations, reason prompts, and state rehydration.
 */
export function useWorkflowAction<T>(config: WorkflowActionConfig<T>) {
  const queryClient = useQueryClient()
  const { notifySuccess, notifyError } = useNotifications()
  const { confirm, prompt } = useDialogs()

  const mutation = useMutation({
    mutationFn: async ({
      action,
      payload,
    }: {
      action: ActionDescriptor
      payload?: Record<string, unknown>
    }) => {
      // 1. Handle Confirmation
      if (action.confirmation) {
        const confirmed = await confirm({
          title: action.confirmation.title,
          message: action.confirmation.message,
          variant: action.variant === 'destructive' ? 'danger' : 'primary',
        })
        if (!confirmed) throw new Error('CANCELLED')
      }

      // 2. Handle Reason Prompt
      let finalPayload = payload
      if (action.requiresReason) {
        const reason = await prompt({
          title: `Reason required for ${action.label}`,
          message: 'Please provide a justification for this action.',
          required: true,
        })
        if (!reason) throw new Error('CANCELLED')
        finalPayload = { ...payload, reason }
      }

      // 3. Execute
      return await config.execute(config.id, action.action, config.version, finalPayload)
    },
    onSuccess: (data) => {
      // Rehydrate cache
      queryClient.setQueryData(config.queryKey, data)
      notifySuccess('Action executed successfully')
      if (config.onSuccess) config.onSuccess(data)
    },
    onError: (err: Error) => {
      if (err.message === 'CANCELLED') return
      notifyError(err.message || 'Failed to execute action')
    },
  })

  const dispatch = (action: ActionDescriptor, payload?: Record<string, unknown>) => {
    mutation.mutate({ action, payload })
  }

  return {
    dispatch,
    isLoading: mutation.isPending,
  }
}
