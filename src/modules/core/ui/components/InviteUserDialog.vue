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
import { AppButton, AppInput } from '@/shared/components/primitives'
import { UserPlus, AlertCircle } from 'lucide-vue-next'
import { useUsers } from '../../application/useUsers'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const { createUser, isCreating } = useUsers()

const form = ref({
  email: '',
  password: '',
})

const errorMessage = ref<string | null>(null)

async function handleSubmit() {
  errorMessage.value = null

  if (!form.value.email || !form.value.password) return
  if (form.value.password.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters.'
    return
  }

  try {
    await createUser({
      email: form.value.email,
      password: form.value.password,
    })
    emit('update:open', false)
    form.value = { email: '', password: '' }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to create user. Check for duplicate emails.'
    errorMessage.value = message
  }
}
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
          v-if="errorMessage"
          class="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3"
        >
          <AlertCircle class="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <p class="text-xs text-red-700 font-medium">{{ errorMessage }}</p>
        </div>

        <AppInput
          v-model="form.email"
          label="Email Address"
          type="email"
          placeholder="user@company.com"
          required
        />

        <div class="space-y-2">
          <AppInput
            v-model="form.password"
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
        <AppButton variant="outline" @click="emit('update:open', false)" :disabled="isCreating">
          Cancel
        </AppButton>
        <AppButton
          variant="primary"
          @click="handleSubmit"
          :disabled="!form.email || !form.password || isCreating"
        >
          {{ isCreating ? 'Creating...' : 'Create User' }}
        </AppButton>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
