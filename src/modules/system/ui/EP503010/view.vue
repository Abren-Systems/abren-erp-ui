<script setup lang="ts">
import { useScreenControllerContext } from '@/platform/screen-runtime'
import { inject } from 'vue'
import { DataGrid } from '@/shared/components/data-grid'
import { AppButton } from '@/shared/components/primitives'
import { RefreshCcw } from 'lucide-vue-next'
import { workflowColumns } from './grids/workflow.grid'
import { AppDialog, AppInput } from '@/shared/components/primitives'
import { ShieldCheck, AlertTriangle, Check } from 'lucide-vue-next'
import { Label } from '@/shared/components/field-system'
const ctrl = useScreenControllerContext() as any // eslint-disable-line @typescript-eslint/no-explicit-any
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

    <AppDialog v-model:open="ctrl.isDialogOpen.value" title="Review Transition" size="sm">
      <div v-if="ctrl.selectedTask.value" class="space-y-4">
        <div
          class="flex items-center gap-4 p-4 bg-[var(--color-primary-50)] rounded-md border border-[var(--color-primary-100)]"
        >
          <ShieldCheck class="h-5 w-5 text-[var(--color-primary-600)]" />
          <div>
            <p
              class="text-[10px] font-bold uppercase tracking-widest text-[var(--color-primary-700)]"
            >
              Target State
            </p>
            <p class="text-sm font-semibold text-[var(--color-primary-900)]">
              {{ ctrl.selectedTask.value.targetState }}
            </p>
          </div>
        </div>

        <div class="space-y-1.5">
          <Label
            class="text-[10px] font-bold uppercase tracking-widest text-[var(--color-neutral-500)]"
          >
            Decision Rationale
          </Label>
          <AppInput
            v-model="ctrl.auditReason.value"
            placeholder="Reason for your decision (Optional)..."
            autocomplete="off"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex gap-2 w-full justify-end">
          <AppButton
            variant="outline"
            @click="ctrl.isDialogOpen.value = false"
            :disabled="ctrl.isSubmitting.value"
          >
            Cancel
          </AppButton>
          <AppButton
            variant="danger"
            @click="ctrl.commands.value['reject']?.execute()"
            :disabled="ctrl.isSubmitting.value"
          >
            <AlertTriangle :size="14" class="mr-2" />
            Reject
          </AppButton>
          <AppButton
            variant="primary"
            @click="ctrl.commands.value['approve']?.execute()"
            :disabled="ctrl.isSubmitting.value"
          >
            <Check :size="14" class="mr-2" />
            Approve
          </AppButton>
        </div>
      </template>
    </AppDialog>
  </div>
</template>
