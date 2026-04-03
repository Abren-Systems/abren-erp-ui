import { useResourceQuery } from '@/shared/composables/useResourceQuery'
import { workflowsAdapter } from '../../infrastructure/workflows_adapter'
import { WorkflowMapper } from '../../infrastructure/mappers'
import { workflowKeys } from '../keys'

/**
 * Use Case: View Pending Workflow Approvals.
 *
 * Fetches and maps pending approval tasks assigned to the current user.
 *
 * @returns Reactive tasks state and refresh capability.
 * @example
 * const { tasks, isLoading, refresh } = usePendingApprovals()
 */
export function usePendingApprovals() {
  const {
    data: tasks,
    isLoading,
    error,
    refetch,
  } = useResourceQuery(
    workflowKeys.pendingTasks(),
    () => workflowsAdapter.getPendingTasks(),
    (dtos) => {
      if (!Array.isArray(dtos)) {
        return []
      }
      return dtos.filter((d) => !!d).map((dto) => WorkflowMapper.toPendingApproval(dto))
    },
    // ERP data can stay stale for a bit, but we want freshness for task lists
    { staleTime: 1000 * 30 },
  )

  return { tasks, isLoading, error, refresh: refetch }
}
