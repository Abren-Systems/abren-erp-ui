<script setup lang="ts">
import { useTenantSettings } from '../../application/useTenantSettings'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { AppButton } from '@/shared/components/primitives'
import { Building2, Settings, Edit3 } from 'lucide-vue-next'
import { usePermissions } from '@/shared/auth/usePermissions'

const { settings, isSettingsPending } = useTenantSettings()
const { hasPermission } = usePermissions()
const gridState = useDataGrid()

const settingColumns = [
  {
    accessorKey: 'key',
    header: 'Configuration Key',
  },
  {
    accessorKey: 'value',
    header: 'Current Value',
    cell: ({ row }: { row: { original: { value: string | null } } }) =>
      row.original.value || 'Default',
  },
]
</script>

<template>
  <div class="flex h-full flex-col bg-[var(--app-canvas)]">
    <!-- Page Header -->
    <div
      class="flex shrink-0 items-center justify-between px-8 py-6 bg-white border-b border-[var(--color-neutral-200)]"
    >
      <div class="flex items-center gap-4">
        <div class="p-2 bg-[var(--color-primary-50)] rounded-sm">
          <Building2 class="h-6 w-6 text-[var(--color-primary-600)]" />
        </div>
        <div>
          <h1 class="m-0 text-xl font-bold tracking-tight text-[var(--color-neutral-900)]">
            Tenant Settings
          </h1>
          <p class="mt-1 text-sm text-[var(--color-neutral-500)]">
            Configure system-wide parameters and module thresholds for your organisation.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <AppButton v-if="hasPermission('core:tenant_edit')" variant="outline">
          <Edit3 :size="14" class="mr-2" />
          Bulk Edit
        </AppButton>
      </div>
    </div>

    <!-- DataGrid Orchestration -->
    <div class="min-h-0 flex-1 p-8">
      <DataGrid
        :data="settings || []"
        :columns="settingColumns"
        :loading="isSettingsPending"
        :state="gridState"
      />
    </div>
  </div>
</template>
