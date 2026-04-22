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
import { ShieldCheck } from 'lucide-vue-next'
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
    <DialogContent class="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 overflow-hidden border-0 shadow-2xl rounded-sm">
      <DialogHeader class="p-6 bg-[var(--color-neutral-50)] border-b">
        <div class="flex items-center gap-4">
          <div class="p-2 bg-[var(--color-primary-50)] rounded-sm">
            <ShieldCheck class="h-5 w-5 text-[var(--color-primary-600)]" />
          </div>
          <div>
            <DialogTitle class="text-[var(--color-neutral-900)] font-bold uppercase tracking-widest text-xs">Define Boundary</DialogTitle>
            <DialogDescription class="text-sm text-[var(--color-neutral-600)] mt-2">
              Construct a new identity boundary by aggregating granular system permissions.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <AppInput
          label="Boundary Name"
          v-model="form.name"
          placeholder="e.g. Senior Accountant"
          required
        />

        <AppInput
          label="Purpose / Description"
          v-model="form.description"
          placeholder="Describe the scope of this boundary..."
          description="A brief explanation of why this role exists."
        />

        <div class="space-y-3">
          <label class="text-[10px] font-bold uppercase tracking-widest text-[var(--color-neutral-500)]">System Permissions</label>
          <div class="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto border border-[var(--color-neutral-200)] rounded-sm p-4 bg-[var(--color-neutral-50)]/50">
            <div
              v-for="perm in permissions"
              :key="perm.code"
              class="flex items-center space-x-3 p-2 rounded-sm hover:bg-white transition-colors border border-transparent hover:border-[var(--color-neutral-200)] hover:shadow-sm"
            >
              <input
                type="checkbox"
                :id="perm.code"
                :checked="form.permissions.includes(perm.code)"
                @change="togglePermission(perm.code)"
                class="w-3.5 h-3.5 rounded-sm border-[var(--color-neutral-300)] text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)] cursor-pointer"
              />
              <label
                :for="perm.code"
                class="text-[11px] font-medium text-[var(--color-neutral-700)] cursor-pointer select-none leading-none"
              >
                {{ perm.code }}
              </label>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter class="p-6 bg-[var(--color-neutral-50)] border-t">
        <AppButton variant="outline" @click="emit('update:open', false)" :disabled="isCreating">
          Cancel
        </AppButton>
        <AppButton variant="primary" @click="handleSubmit" :disabled="!form.name || isCreating">
          {{ isCreating ? 'Creating...' : 'Save Boundary' }}
        </AppButton>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
