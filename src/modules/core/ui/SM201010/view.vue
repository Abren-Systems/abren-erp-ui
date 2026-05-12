<script setup lang="ts">
import { useScreenControllerContext } from '@/platform/screen-runtime'
import { inject } from 'vue'
import { DataGrid } from '@/shared/components/data-grid'
import { AppButton, AppInput } from '@/shared/components/primitives'
import { AppField } from '@/shared/components/field-system'
import { AppDialog } from '@/shared/components/primitives'
import { userColumns } from './grids/user.grid'

const ctrl = useScreenControllerContext() as any // eslint-disable-line @typescript-eslint/no-explicit-any
</script>

<template>
  <div class="flex h-full flex-col bg-[var(--color-neutral-50)]">
    <div class="min-h-0 flex-1 p-2.5">
      <DataGrid
        v-model:sorting="ctrl.gridState.sorting"
        v-model:row-selection="ctrl.gridState.rowSelection"
        v-model:column-visibility="ctrl.gridState.columnVisibility"
        v-model:global-filter="ctrl.gridState.globalFilter"
        :data="ctrl.users.value || []"
        :columns="userColumns"
        :loading="ctrl.isLoading.value"
        placeholder="Search users..."
        row-clickable
        @row-click="ctrl.handleRowClick"
      >
        <template #toolbar>
          <AppButton
            variant="primary"
            size="sm"
            @click="
              (
                ctrl.model.value.ui.actions.primary.find((a) => a.command.id === 'invite') ||
                ctrl.model.value.ui.actions.secondary.find((a) => a.command.id === 'invite')
              )?.command?.execute()
            "
          >
            Invite User
          </AppButton>
        </template>
      </DataGrid>
    </div>

    <!-- Invite Dialog -->
    <AppDialog
      v-model:open="ctrl.isInviteOpen.value"
      title="Invite User"
      description="Send an invitation to join the organization."
    >
      <div class="space-y-4 py-4">
        <AppField
          field="invite-email"
          label="Email Address"
          type="text"
          mode="edit"
          :model-value="ctrl.inviteEmail.value"
          @update:model-value="ctrl.inviteEmail.value = $event"
          :editor-attrs="{ placeholder: 'user@example.com' }"
        />
        <div class="space-y-1">
          <label class="text-sm font-medium">Initial Password</label>
          <AppInput v-model="ctrl.invitePassword.value" type="password" />
        </div>
        <p v-if="ctrl.inviteErrorMessage.value" class="text-sm text-red-600">
          {{ ctrl.inviteErrorMessage.value }}
        </p>
      </div>
      <template #footer>
        <AppButton variant="ghost" @click="ctrl.isInviteOpen.value = false">Cancel</AppButton>
        <AppButton
          variant="primary"
          :loading="
            (
              ctrl.model.value.ui.actions.primary.find((a) => a.command.id === 'executeInvite') ||
              ctrl.model.value.ui.actions.secondary.find((a) => a.command.id === 'executeInvite')
            )?.command?.isPending.value
          "
          @click="
            (
              ctrl.model.value.ui.actions.primary.find((a) => a.command.id === 'executeInvite') ||
              ctrl.model.value.ui.actions.secondary.find((a) => a.command.id === 'executeInvite')
            )?.command?.execute()
          "
        >
          Send Invite
        </AppButton>
      </template>
    </AppDialog>

    <!-- Assign Role Dialog -->
    <AppDialog
      v-model:open="ctrl.isAssignmentOpen.value"
      title="Assign Role"
      description="Update the user's permissions and access level."
    >
      <div class="space-y-4 py-4">
        <div v-if="ctrl.selectedUser.value" class="space-y-1">
          <p class="text-sm">
            Assigning role for <strong>{{ ctrl.selectedUser.value.email }}</strong>
          </p>
        </div>
        <AppField
          field="assign-role"
          label="Role"
          type="selector"
          mode="edit"
          :model-value="ctrl.assignRoleId.value"
          @update:model-value="ctrl.assignRoleId.value = $event"
          :editor-attrs="{ options: ctrl.roleOptions.value, placeholder: 'Select a role' }"
        />
      </div>
      <template #footer>
        <AppButton variant="ghost" @click="ctrl.isAssignmentOpen.value = false">Cancel</AppButton>
        <AppButton
          variant="primary"
          :loading="
            (
              ctrl.model.value.ui.actions.primary.find((a) => a.command.id === 'executeAssign') ||
              ctrl.model.value.ui.actions.secondary.find((a) => a.command.id === 'executeAssign')
            )?.command?.isPending.value
          "
          @click="
            (
              ctrl.model.value.ui.actions.primary.find((a) => a.command.id === 'executeAssign') ||
              ctrl.model.value.ui.actions.secondary.find((a) => a.command.id === 'executeAssign')
            )?.command?.execute()
          "
        >
          Update Role
        </AppButton>
      </template>
    </AppDialog>
  </div>
</template>
