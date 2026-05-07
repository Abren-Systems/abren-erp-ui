<script setup lang="ts">
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { FormTitleBar } from '@/platform/chrome'
import { AppButton, AppInput, AppSelect } from '@/shared/components/primitives'
import { AppDialog } from '@/shared/components/workspace'
import { userColumns } from './grids/user.grid'
import { useUsersController } from './controller'

const ctrl = useUsersController()
const gridState = useDataGrid()
</script>

<template>
  <div class="flex h-full flex-col bg-[var(--color-neutral-50)]">
    <FormTitleBar :form-title="ctrl.screen.titleKey" />

    <div class="min-h-0 flex-1 p-8">
      <DataGrid
        v-model:sorting="gridState.sorting"
        v-model:row-selection="gridState.rowSelection"
        v-model:column-visibility="gridState.columnVisibility"
        v-model:global-filter="gridState.globalFilter"
        :data="ctrl.users.value || []"
        :columns="userColumns"
        :loading="ctrl.isLoading.value"
        placeholder="Search users..."
        row-clickable
        @row-click="ctrl.handleRowClick"
      >
        <template #toolbar>
          <AppButton variant="primary" size="sm" @click="ctrl.commands.value['invite']?.execute()">
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
        <div class="space-y-1">
          <label class="text-sm font-medium">Email Address</label>
          <AppInput v-model="ctrl.inviteEmail.value" placeholder="user@example.com" />
        </div>
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
          :loading="ctrl.commands.value['executeInvite']?.isPending.value"
          @click="ctrl.commands.value['executeInvite']?.execute()"
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
        <div class="space-y-1">
          <label class="text-sm font-medium">Role</label>
          <AppSelect
            v-model="ctrl.assignRoleId.value"
            :options="ctrl.roleOptions.value"
            placeholder="Select a role"
          />
        </div>
      </div>
      <template #footer>
        <AppButton variant="ghost" @click="ctrl.isAssignmentOpen.value = false">Cancel</AppButton>
        <AppButton
          variant="primary"
          :loading="ctrl.commands.value['executeAssign']?.isPending.value"
          @click="ctrl.commands.value['executeAssign']?.execute()"
        >
          Update Role
        </AppButton>
      </template>
    </AppDialog>
  </div>
</template>
