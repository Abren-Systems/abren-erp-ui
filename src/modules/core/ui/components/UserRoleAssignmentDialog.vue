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
import { AppButton, AppSelect } from '@/shared/components/primitives'
import { UserCog } from 'lucide-vue-next'
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
    <DialogContent class="sm:max-w-[425px] p-0 overflow-hidden border-0 shadow-2xl rounded-sm">
      <DialogHeader class="p-6 bg-[var(--color-neutral-50)] border-b">
        <div class="flex items-center gap-4">
          <div class="p-2 bg-[var(--color-primary-50)] rounded-sm">
            <UserCog class="h-5 w-5 text-[var(--color-primary-600)]" />
          </div>
          <div>
            <DialogTitle class="text-[var(--color-neutral-900)] font-bold uppercase tracking-widest text-xs">Assign Access</DialogTitle>
            <DialogDescription class="text-sm text-[var(--color-neutral-600)] mt-2">
              Grant additional access boundaries to <strong>{{ user?.email }}</strong>.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div class="p-6">
        <AppSelect
          label="Available Roles"
          v-model="selectedRoleId"
          :options="roles?.map((r) => ({ label: r.name, value: r.id })) ?? []"
          placeholder="Select a boundary..."
          required
        />
        <p
          v-if="isRolesPending"
          class="text-[10px] text-[var(--color-neutral-400)] italic animate-pulse mt-2"
        >
          Hydrating identity boundaries...
        </p>
      </div>

      <DialogFooter class="p-6 bg-[var(--color-neutral-50)] border-t">
        <AppButton variant="outline" @click="emit('update:open', false)" :disabled="isAssigning">
          Cancel
        </AppButton>
        <AppButton
          variant="primary"
          @click="handleAssign"
          :disabled="!selectedRoleId || isAssigning"
        >
          {{ isAssigning ? 'Assigning...' : 'Assign Access' }}
        </AppButton>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
