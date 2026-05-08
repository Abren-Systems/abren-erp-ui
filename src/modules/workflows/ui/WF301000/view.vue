<script setup lang="ts">
import { ScreenControllerKey } from '@/platform/screen-runtime'
import { inject } from 'vue'
import { DataGrid } from '@/shared/components/data-grid'
import { AppButton } from '@/shared/components/primitives'
import { RefreshCcw } from 'lucide-vue-next'
import { workflowColumns } from '../grids/workflow.grid'

import WorkflowActionDialog from '../components/WorkflowActionDialog.vue'

const ctrl = inject(ScreenControllerKey)!.value! as any // eslint-disable-line @typescript-eslint/no-explicit-any
</script>

<template>
  <div class="flex h-full flex-col bg-[var(--color-neutral-50)]">
    <!-- DataGrid Orchestration -->
    <div class="min-h-0 flex-1 p-8">
      <DataGrid
        v-model:sorting="ctrl.gridState.sorting"
        v-model:row-selection="ctrl.gridState.rowSelection"
        v-model:column-visibility="ctrl.gridState.columnVisibility"
        v-model:global-filter="ctrl.gridState.globalFilter"
        :data="ctrl.tasks.value || []"
        :columns="workflowColumns"
        :loading="ctrl.isLoading.value"
        placeholder="Search pending tasks..."
        empty-message="No pending approvals found."
        row-clickable
        @row-click="ctrl.handleRowClick"
      >
        <template #toolbar>
          <AppButton
            variant="stealth"
            @click="
              (
                ctrl.model.value.ui.actions.primary.find((a) => a.command.key === 'refresh') ||
                ctrl.model.value.ui.actions.secondary.find((a) => a.command.key === 'refresh')
              )?.command?.execute()
            "
          >
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
      :is-pending="ctrl.isSubmitting.value"
      @close="ctrl.isDialogOpen.value = false"
      @approve="
        (comments) =>
          ctrl.model.value.ui.actions.primary
            .find((a) => a.command.key === 'approve')
            ?.command?.execute(comments)
      "
      @reject="
        (comments) =>
          ctrl.model.value.ui.actions.secondary
            .find((a) => a.command.key === 'reject')
            ?.command?.execute(comments)
      "
    />
  </div>
</template>
