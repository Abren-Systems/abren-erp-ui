<script setup lang="ts">
import { ref } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/dialog'
import { Button } from '@/shared/components/button'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'
import { Textarea } from '@/shared/components/textarea'
import { useRoles } from '../../application/composables/useRoles'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const { createRole, isCreating, permissions } = useRoles()

const form = ref({
  name: '',
  description: '',
  permissions: [] as string[],
})

async function handleSubmit() {
  if (!form.value.name) return

  try {
    await createRole({
      name: form.value.name,
      description: form.value.description,
      permissions: form.value.permissions,
    })
    emit('update:open', false)
    form.value = { name: '', description: '', permissions: [] }
  } catch (err) {
    console.error('Failed to create role:', err)
  }
}

function togglePermission(code: string) {
  const index = form.value.permissions.indexOf(code)
  if (index > -1) {
    form.value.permissions.splice(index, 1)
  } else {
    form.value.permissions.push(code)
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[600px] max-h-[90vh] flex flex-col">
      <DialogHeader>
        <DialogTitle>Define Boundary (Role)</DialogTitle>
        <DialogDescription>
          Construct a new identity boundary by aggregating granular system permissions.
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 overflow-y-auto pr-2 space-y-6 py-4">
        <div class="grid gap-2">
          <Label for="name">Boundary Name</Label>
          <Input id="name" v-model="form.name" placeholder="e.g. Senior Accountant" />
        </div>

        <div class="grid gap-2">
          <Label for="description">Purpose / Description</Label>
          <Textarea
            id="description"
            v-model="form.description"
            placeholder="Describe the scope of this boundary..."
          />
        </div>

        <div class="space-y-4">
          <Label>System Permissions</Label>
          <div
            class="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto border rounded-md p-3 bg-neutral-50/50"
          >
            <div
              v-for="perm in permissions"
              :key="perm.code"
              class="flex items-center space-x-2 p-2 rounded hover:bg-neutral-100 transition-colors"
            >
              <input
                type="checkbox"
                :id="perm.code"
                :checked="form.permissions.includes(perm.code)"
                @change="togglePermission(perm.code)"
                class="w-4 h-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                :for="perm.code"
                class="text-xs font-medium text-neutral-700 cursor-pointer select-none leading-none"
              >
                {{ perm.code }}
              </label>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter class="pt-4 border-t">
        <Button variant="outline" @click="emit('update:open', false)" :disabled="isCreating">
          Cancel
        </Button>
        <Button @click="handleSubmit" :disabled="!form.name || isCreating">
          {{ isCreating ? 'Creating...' : 'Save Boundary' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
