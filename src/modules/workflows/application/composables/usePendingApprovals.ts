import { useApiQuery } from '@/shared/composables/useApiQuery'
import { workflowsAdapter } from '../../infrastructure/workflows_adapter'
import { workflowKeys } from '../keys'

/**
 * Use Case: View Pending Workflow Approvals.
 *
 * Fetches and maps pending approval tasks assigned to the current user.
 *
 * @returns Reactive tasks state and refresh capability.
 */
export function usePendingApprovals() {
  const {
    data: tasks,
    isLoading,
    error,
    refetch,
  } = useApiQuery(workflowKeys.pendingTasks(), () => workflowsAdapter.getPendingTasks(), {
    // ERP data can stay stale for a bit, but we want freshness for task lists
    staleTime: 1000 * 30,
  })

  return { tasks, isLoading, error, refresh: refetch }
}
