<script setup lang="ts">
// arch-guard-disable PII-02
import { ref } from 'vue'
import { AppButton, AppInput } from '@/shared/components/primitives'
import { ShieldCheck, AlertTriangle, Check } from 'lucide-vue-next'

const props = defineProps<{
  instanceId: string
  targetState: string
  isOpen: boolean
  isPending: boolean
}>()

const emit = defineEmits<{
  close: []
  approve: [comments: string]
  reject: [comments: string]
}>()

const comments = ref('')

function handleAction(action: 'APPROVE' | 'REJECT') {
  if (action === 'APPROVE') {
    emit('approve', comments.value)
  } else {
    emit('reject', comments.value)
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-neutral-900)]/60 backdrop-blur-sm p-4"
  >
    <div
      class="w-full max-w-md bg-white rounded-sm shadow-2xl overflow-hidden flex flex-col border border-[var(--color-neutral-200)]"
    >
      <header
        class="px-8 py-6 bg-white border-b border-[var(--color-neutral-200)] flex items-center gap-4"
      >
        <div class="p-2 bg-[var(--color-primary-50)] rounded-sm">
          <ShieldCheck class="h-5 w-5 text-[var(--color-primary-600)]" />
        </div>
        <div>
          <h3 class="text-lg font-bold text-[var(--color-neutral-900)]">Review Transition</h3>
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-[var(--color-neutral-500)] mt-0.5"
          >
            Target State: <span class="text-[var(--color-primary-600)]">{{ targetState }}</span>
          </p>
        </div>
      </header>

      <div class="px-8 py-6 bg-[var(--color-neutral-50)]/30 space-y-4">
        <div class="space-y-1.5">
          <Label
            class="text-[10px] font-bold uppercase tracking-widest text-[var(--color-neutral-500)]"
            >Decision Rationale</Label
          >
          <AppInput
            v-model="comments"
            placeholder="Reason for your decision (Optional)..."
            autocomplete="off"
          />
        </div>
      </div>

      <footer
        class="px-8 py-4 bg-white border-t border-[var(--color-neutral-200)] flex items-center justify-end gap-3"
      >
        <AppButton variant="outline" @click="emit('close')" :disabled="isPending">
          Cancel
        </AppButton>
        <AppButton variant="danger" @click="handleAction('REJECT')" :disabled="isPending">
          <AlertTriangle :size="14" class="mr-2" />
          Reject
        </AppButton>
        <AppButton variant="primary" @click="handleAction('APPROVE')" :disabled="isPending">
          <Check :size="14" class="mr-2" />
          Approve
        </AppButton>
      </footer>
    </div>
  </div>
</template>
