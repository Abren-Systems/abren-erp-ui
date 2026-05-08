<script setup lang="ts">
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

const props = defineProps<{
  open: boolean
  controller: UsersController
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()
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
            <DialogTitle
              class="text-[var(--color-neutral-900)] font-bold uppercase tracking-widest text-xs"
              >Assign Access</DialogTitle
            >
            <DialogDescription class="text-sm text-[var(--color-neutral-600)] mt-2">
              Grant additional access boundaries to
              <strong>{{ controller.selectedUser.value?.email }}</strong
              >.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div class="p-6">
        <AppSelect
          label="Available Roles"
          v-model="controller.assignRoleId.value"
          :options="controller.roles.value?.map((r) => ({ label: r.name, value: r.id })) ?? []"
          placeholder="Select a boundary..."
          required
        />
        <p
          v-if="controller.isRolesPending.value"
          class="text-[10px] text-[var(--color-neutral-400)] italic animate-pulse mt-2"
        >
          Hydrating identity boundaries...
        </p>
      </div>

      <DialogFooter class="p-6 bg-[var(--color-neutral-50)] border-t">
        <AppButton
          variant="outline"
          @click="emit('update:open', false)"
          :disabled="controller.commands.value['executeAssign']?.isPending.value"
        >
          Cancel
        </AppButton>
        <AppButton
          variant="primary"
          @click="controller.commands.value['executeAssign']?.execute()"
          :disabled="
            !controller.assignRoleId.value ||
            controller.commands.value['executeAssign']?.isPending.value
          "
        >
          {{
            controller.commands.value['executeAssign']?.isPending.value
              ? 'Assigning...'
              : 'Assign Access'
          }}
        </AppButton>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
