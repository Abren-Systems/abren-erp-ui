<script setup lang="ts">
import { ref } from 'vue'
import { DataGrid, useDataGrid } from '@/core/ui/data-grid'
import { workflowColumns } from '../grids/workflow.grid'
import { usePendingApprovals } from '../../application/composables/usePendingApprovals'
import WorkflowActionDialog from '../components/WorkflowActionDialog.vue'
import type { PendingApproval } from '../../domain/models/workflow.types'

const { tasks, isLoading, error, refresh } = usePendingApprovals()
const { gridState } = useDataGrid()

const selectedTask = ref<PendingApproval | null>(null)
const isDialogOpen = ref(false)

function handleRowClick(task: PendingApproval) {
  selectedTask.value = task
  isDialogOpen.value = true
}

function handleSuccess() {
  refresh()
  selectedTask.value = null
}
</script>

<template>
  <div class="p-6 space-y-6">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Workflow Inbox</h1>
        <p class="text-sm text-neutral-500">Review and approve pending tasks across all modules.</p>
      </div>
    </header>

    <DataGrid
      v-model:sorting="gridState.sorting"
      v-model:row-selection="gridState.rowSelection"
      v-model:column-visibility="gridState.columnVisibility"
      v-model:global-filter="gridState.globalFilter"
      :data="tasks || []"
      :columns="workflowColumns"
      :loading="isLoading"
      @row-click="handleRowClick"
    />

    <WorkflowActionDialog
      v-if="selectedTask"
      :instance-id="selectedTask.id"
      :target-state="selectedTask.targetState || ''"
      :is-open="isDialogOpen"
      @close="isDialogOpen = false"
      @success="handleSuccess"
    />
  </div>
</template>
