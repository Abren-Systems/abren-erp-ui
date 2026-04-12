<script setup lang="ts">
import { MoreHorizontal } from 'lucide-vue-next'
import { Button } from '@/shared/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu'
import type { Action } from '../types'

defineProps<{
  row: unknown
  actions: Action<unknown>[]
}>()
</script>

<template>
  <div class="flex justify-end">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" class="h-8 w-8 p-0">
          <span class="sr-only">Open menu</span>
          <MoreHorizontal class="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          v-for="action in actions"
          :key="action.label"
          :class="action.variant === 'destructive' ? 'text-danger-600' : ''"
          @click="action.onClick(row)"
        >
          <component :is="action.icon" v-if="action.icon" class="mr-2 h-4 w-4" />
          {{ action.label }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
