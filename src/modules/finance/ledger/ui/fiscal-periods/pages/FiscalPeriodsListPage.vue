<script setup lang="ts">
import { h, ref } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { useFiscalPeriods } from '../../../application/composables/useFiscalPeriods'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/dialog'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'
import type { components } from '@/shared/api/generated.types'

const { periods, isLoading, createPeriod } = useFiscalPeriods()
const { sorting, rowSelection, columnVisibility, globalFilter } = useDataGrid()

type FiscalPeriodRead = components['schemas']['FiscalPeriodRead']
const columns: ColumnDef<FiscalPeriodRead>[] = [
  { accessorKey: 'name', header: 'Period Name' },
  { accessorKey: 'start_date', header: 'Start Date' },
  { accessorKey: 'end_date', header: 'End Date' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      let variant: 'default' | 'secondary' | 'outline' = 'secondary'
      if (status === 'OPEN') variant = 'default'
      if (status === 'CLOSED') variant = 'outline'
      return h(Badge, { variant }, () => status)
    },
  },
]

const newPeriod = ref({
  name: '',
  start_date: '',
  end_date: '',
})

const isDialogOpen = ref(false)

const handleCreate = async () => {
  try {
    await createPeriod({
      name: newPeriod.value.name,
      start_date: newPeriod.value.start_date,
      end_date: newPeriod.value.end_date,
    })
    isDialogOpen.value = false
    newPeriod.value = { name: '', start_date: '', end_date: '' }
  } catch (err) {
    // Error handled in composable
  }
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 20px; height: 100%">
    <div style="display: flex; justify-content: space-between; align-items: center">
      <h1 style="font-size: 22px; font-weight: 700; color: var(--color-grid-text); margin: 0">
        Fiscal Periods
      </h1>

      <Dialog v-model:open="isDialogOpen">
        <DialogTrigger as-child>
          <Button variant="default">New Period</Button>
        </DialogTrigger>
        <DialogContent class="sm:max-width-[425px]">
          <DialogHeader>
            <DialogTitle>Create Fiscal Period</DialogTitle>
            <DialogDescription> Define a new timeframe for financial postings. </DialogDescription>
          </DialogHeader>
          <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="name" class="text-right">Name</Label>
              <Input
                id="name"
                v-model="newPeriod.name"
                class="col-span-3"
                placeholder="e.g. Q1 2026"
              />
            </div>
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="start" class="text-right">Start</Label>
              <Input id="start" type="date" v-model="newPeriod.start_date" class="col-span-3" />
            </div>
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="end" class="text-right">End</Label>
              <Input id="end" type="date" v-model="newPeriod.end_date" class="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" @click="handleCreate" :disabled="isLoading">Create Period</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

    <div style="flex: 1; min-height: 0">
      <DataGrid
        :columns="columns"
        :data="periods"
        :loading="isLoading"
        v-model:sorting="sorting"
        v-model:row-selection="rowSelection"
        v-model:column-visibility="columnVisibility"
        v-model:global-filter="globalFilter"
        placeholder="Search periods…"
      />
    </div>
  </div>
</template>
