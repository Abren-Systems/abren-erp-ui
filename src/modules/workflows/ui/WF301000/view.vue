<script setup lang="ts">
import { ref } from 'vue'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { Inbox, CheckCircle2 } from 'lucide-vue-next'
import { workflowColumns } from '../grids/workflow.grid'
import { usePendingApprovals } from '../../application/usePendingApprovals'
import WorkflowActionDialog from '../components/WorkflowActionDialog.vue'
import type { PendingApproval } from '../../domain/workflows.types'

const { tasks, isLoading, refresh } = usePendingApprovals()
const gridState = useDataGrid()

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
  <div class="flex h-full flex-col bg-[var(--app-canvas)]">
    <!-- Page Header -->
    <div
      class="flex shrink-0 items-center justify-between px-8 py-6 bg-white border-b border-[var(--color-neutral-200)]"
    >
      <div class="flex items-center gap-4">
        <div class="p-2 bg-[var(--color-primary-50)] rounded-sm">
          <Inbox class="h-6 w-6 text-[var(--color-primary-600)]" />
        </div>
        <div>
          <h1 class="m-0 text-xl font-bold tracking-tight text-[var(--color-neutral-900)]">
            Workflow Inbox
          </h1>
          <p class="mt-1 text-sm text-[var(--color-neutral-500)]">
            Review and approve pending tasks across all modules.
          </p>
        </div>
      </div>
    </div>

    <!-- DataGrid Orchestration -->
    <div class="min-h-0 flex-1 p-8">
      <DataGrid
        :data="tasks || []"
        :columns="workflowColumns"
        :loading="isLoading"
        :state="gridState"
        @row-click="handleRowClick"
      />
    </div>

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
