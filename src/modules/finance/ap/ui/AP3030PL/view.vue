<script setup lang="ts">
import { DataGrid } from '@/shared/components/data-grid'
import { useScreenControllerContext } from '@/platform/screen-runtime'
import { vendorListColumns } from './grids/vendors.grid'

const ctrl = useScreenControllerContext() as never
// Using never here because we know it exists but the runtime type is complex

const handleRowClick = (row: { original: { id: string } }) => {
  ctrl.navigateToDetail(row.original.id)
}
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--app-surface)]">
    <DataGrid
      :columns="vendorListColumns"
      :data="ctrl.vendors"
      :loading="ctrl.screen.dataSource?.isLoading"
      @row-click="handleRowClick"
      empty-message="No vendors found"
    />
  </div>
</template>
