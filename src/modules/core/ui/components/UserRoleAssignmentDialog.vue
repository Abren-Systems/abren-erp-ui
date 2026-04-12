<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/dialog'
import { Button } from '@/shared/components/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select'
import { Label } from '@/shared/components/label'
import { useRoles } from '../../application/composables/useRoles'
import { useUsers } from '../../application/composables/useUsers'
import type { User } from '../../domain/user.types'

const props = defineProps<{
  user: User | null
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const { roles, isRolesPending } = useRoles()
const { assignRole, isAssigning } = useUsers()

const selectedRoleId = ref<string>('')

async function handleAssign() {
  if (!props.user || !selectedRoleId.value) return

  try {
    await assignRole({
      user_id: props.user.id,
      role_id: selectedRoleId.value,
    })
    emit('update:open', false)
    selectedRoleId.value = ''
  } catch (err) {
    console.error('Failed to assign role:', err)
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Assign Role</DialogTitle>
        <DialogDescription>
          Grant additional access boundaries to <strong>{{ user?.email }}</strong
          >.
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="space-y-2">
          <Label for="role">Available Roles</Label>
          <Select v-model="selectedRoleId">
            <SelectTrigger id="role">
              <SelectValue placeholder="Select a boundary..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="role in roles" :key="role.id" :value="role.id">
                {{ role.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="isRolesPending" class="text-xs text-muted-foreground animate-pulse">
            Loading roles...
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="emit('update:open', false)" :disabled="isAssigning">
          Cancel
        </Button>
        <Button @click="handleAssign" :disabled="!selectedRoleId || isAssigning">
          {{ isAssigning ? 'Assigning...' : 'Assign Boundary' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
