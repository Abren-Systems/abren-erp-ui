import { useDataGrid } from '@/shared/components/data-grid'
import { computed, ref } from 'vue'
import {
  useScreenController,
  LIST_SCREEN_POLICY,
  listScreenDomainState,
} from '@/platform/screen-runtime'
import { usePendingApprovals } from '../../application/usePendingApprovals'
import { useApprovalAction } from '../../application/useApprovalAction'
import { WF301000 } from './screen'
import type { PendingApproval } from '../../domain/workflows.types'

export function useWorkflowInboxController() {
  const gridState = useDataGrid()
  const { tasks, isLoading, error, refresh } = usePendingApprovals()
  const { mutateAsync: submitAction, isPending: isSubmitting } = useApprovalAction()

  const base = useScreenController<PendingApproval[], 'VIEW'>({
    screen: WF301000,
    dataSource: {
      entity: tasks,
      isLoading,
      error,
    },
    isNew: computed(() => false),
    getDomainState: listScreenDomainState,
    statePolicy: LIST_SCREEN_POLICY,
  })

  // Register Commands
  base.registerCommand('refresh', {
    execute: async () => {
      await refresh()
    },
    isPending: isLoading,
  })

  // We register business actions as formal commands on the controller
  base.registerCommand('approve', {
    execute: async (...args: unknown[]) => {
      const comments = (args[0] as string) || ''
      if (!selectedTask.value) return
      await submitAction({ instanceId: selectedTask.value.id, action: 'APPROVE', comments })
      handleSuccess()
    },
    isPending: isSubmitting,
  })

  base.registerCommand('reject', {
    execute: async (...args: unknown[]) => {
      const comments = (args[0] as string) || ''
      if (!selectedTask.value) return
      await submitAction({ instanceId: selectedTask.value.id, action: 'REJECT', comments })
      handleSuccess()
    },
    isPending: isSubmitting,
  })

  const selectedTask = ref<PendingApproval | null>(null)
  const isDialogOpen = ref(false)

  const handleRowClick = (row: unknown) => {
    selectedTask.value = row as PendingApproval
    isDialogOpen.value = true
  }

  const handleSuccess = () => {
    void refresh()
    selectedTask.value = null
    isDialogOpen.value = false
  }

  return {
    ...base,
    tasks,
    selectedTask,
    isDialogOpen,
    isSubmitting,
    handleRowClick,
    handleSuccess,
    gridState,
  }
}
