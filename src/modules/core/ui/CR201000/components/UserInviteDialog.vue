<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/dialog'
import { AppButton, AppInput } from '@/shared/components/primitives'
import { UserPlus, AlertCircle } from 'lucide-vue-next'

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
    <DialogContent
      class="sm:max-w-[480px] max-h-[90vh] flex flex-col p-0 overflow-hidden border-0 shadow-2xl rounded-sm"
    >
      <DialogHeader class="p-6 bg-[var(--color-neutral-50)] border-b">
        <div class="flex items-center gap-4">
          <div class="p-2 bg-[var(--color-primary-50)] rounded-sm">
            <UserPlus class="h-5 w-5 text-[var(--color-primary-600)]" />
          </div>
          <div>
            <DialogTitle
              class="text-[var(--color-neutral-900)] font-bold uppercase tracking-widest text-xs"
              >Invite User</DialogTitle
            >
            <DialogDescription class="text-sm text-[var(--color-neutral-600)] mt-2">
              Create a new user account within the current tenant.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div class="flex-1 overflow-y-auto p-6 space-y-5">
        <!-- Error Banner -->
        <div
          v-if="controller.inviteErrorMessage.value"
          class="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3"
        >
          <AlertCircle class="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <p class="text-xs text-red-700 font-medium">{{ controller.inviteErrorMessage.value }}</p>
        </div>

        <AppInput
          v-model="controller.inviteEmail.value"
          label="Email Address"
          type="email"
          placeholder="user@company.com"
          required
        />

        <div class="space-y-2">
          <AppInput
            v-model="controller.invitePassword.value"
            label="Temporary Password"
            type="password"
            placeholder="Minimum 8 characters"
            required
          />
          <p class="text-[11px] text-[var(--color-neutral-500)] leading-relaxed">
            Share this password securely with the new user. They will use it for their first login.
          </p>
        </div>
      </div>

      <DialogFooter class="p-6 bg-[var(--color-neutral-50)] border-t">
        <AppButton
          variant="outline"
          @click="emit('update:open', false)"
          :disabled="controller.commands.value['executeInvite']?.isPending.value"
        >
          Cancel
        </AppButton>
        <AppButton
          variant="primary"
          @click="controller.commands.value['executeInvite']?.execute()"
          :disabled="
            !controller.inviteEmail.value ||
            !controller.invitePassword.value ||
            controller.commands.value['executeInvite']?.isPending.value
          "
        >
          {{
            controller.commands.value['executeInvite']?.isPending.value
              ? 'Creating...'
              : 'Create User'
          }}
        </AppButton>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
