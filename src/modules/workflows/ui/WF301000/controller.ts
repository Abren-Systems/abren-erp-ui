import { computed, ref } from 'vue'
import { useScreenController } from '@/platform/screen-runtime'
import { usePendingApprovals } from '../../application/usePendingApprovals'
import { WF301000 } from './screen'
import { WF301000_POLICY } from './policy'
import type { PendingApproval } from '../../domain/workflows.types'

export function useWorkflowInboxController() {
  const { tasks, isLoading, error, refresh } = usePendingApprovals()

  const base = useScreenController<PendingApproval[], 'INBOX'>({
    screen: WF301000,
    dataSource: {
      entity: tasks,
      isLoading,
      error,
    },
    isNew: computed(() => false),
    getDomainState: () => 'INBOX',
    statePolicy: WF301000_POLICY,
  })

  // Register Commands
  base.registerCommand('refresh', {
    execute: async () => {
      await refresh()
    },
    isPending: isLoading,
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
    handleRowClick,
    handleSuccess,
  }
}
