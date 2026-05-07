<script setup lang="ts">
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { FormTitleBar } from '@/platform/chrome'
import { AppButton } from '@/shared/components/primitives'
import { RefreshCcw } from 'lucide-vue-next'
import { workflowColumns } from '../grids/workflow.grid'
import { useWorkflowInboxController } from './controller'
import WorkflowActionDialog from '../components/WorkflowActionDialog.vue'

const ctrl = useWorkflowInboxController()
const gridState = useDataGrid()
</script>

<template>
  <div class="flex h-full flex-col bg-[var(--color-neutral-50)]">
    <FormTitleBar :form-title="ctrl.screen.titleKey" />

    <!-- DataGrid Orchestration -->
    <div class="min-h-0 flex-1 p-8">
      <DataGrid
        v-model:sorting="gridState.sorting"
        v-model:row-selection="gridState.rowSelection"
        v-model:column-visibility="gridState.columnVisibility"
        v-model:global-filter="gridState.globalFilter"
        :data="ctrl.tasks.value || []"
        :columns="workflowColumns"
        :loading="ctrl.isLoading.value"
        placeholder="Search pending tasks..."
        empty-message="No pending approvals found."
        row-clickable
        @row-click="ctrl.handleRowClick"
      >
        <template #toolbar>
          <AppButton variant="stealth" @click="ctrl.commands.value['refresh']?.execute()">
            <template #start>
              <RefreshCcw :class="['h-3.5 w-3.5', ctrl.isLoading.value && 'animate-spin']" />
            </template>
            Refresh
          </AppButton>
        </template>
      </DataGrid>
    </div>

    <WorkflowActionDialog
      v-if="ctrl.selectedTask.value"
      :instance-id="ctrl.selectedTask.value.id"
      :target-state="ctrl.selectedTask.value.targetState || ''"
      :is-open="ctrl.isDialogOpen.value"
      @close="ctrl.isDialogOpen.value = false"
      @success="ctrl.handleSuccess"
    />
  </div>
</template>
