import { useQuery } from '@tanstack/vue-query'
import { workflowsAdapter } from '../../infrastructure/workflows_adapter'
import { mapToPendingApproval } from '../../domain/mappers/workflow.mapper'

export function usePendingApprovals() {
  const {
    data: tasks,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['workflow-pending-tasks'],
    queryFn: async () => {
      const dtos = await workflowsAdapter.getPendingTasks()
      if (!Array.isArray(dtos)) {
        console.warn('Expected array for pending tasks, got:', dtos)
        return []
      }
      return dtos.filter((d) => !!d).map(mapToPendingApproval)
    },
    // ERP data can stay stale for a bit, but we want freshness for task lists
    staleTime: 1000 * 30,
  })

  return { tasks, isLoading, error, refresh: refetch }
}
