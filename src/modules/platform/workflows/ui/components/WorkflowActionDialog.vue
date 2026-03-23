<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Button } from '@/core/ui/button'
import { Input } from '@/core/ui/input'
import { Label } from '@/core/ui/label'
import { useApprovalAction } from '../../application/composables/useApprovalAction'

const props = defineProps<{
  instanceId: string
  targetState: string
  isOpen: boolean
}>()

const emit = defineEmits(['close', 'success'])

const { mutateAsync: submitAction, isPending } = useApprovalAction()
const comments = ref('')

async function handleAction(action: 'APPROVE' | 'REJECT') {
  try {
    await submitAction({
      instanceId: props.instanceId,
      action,
      comments: comments.value,
    })
    emit('success')
    emit('close')
  } catch (e) {
    console.error('Failed to submit approval', e)
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm">
    <div class="w-full max-w-md bg-white p-6 rounded-lg shadow-xl space-y-4">
      <header>
        <h3 class="text-xl font-bold">Review Transition</h3>
        <p class="text-sm text-neutral-500">
          Decide the fate of this request. Target state: <span class="font-bold text-primary-600">{{ targetState }}</span>
        </p>
      </header>

      <div class="space-y-2">
        <Label for="comments">Comments (Optional)</Label>
        <Input 
          id="comments" 
          v-model="comments" 
          placeholder="Reason for your decision..." 
          autocomplete="off"
        />
      </div>

      <footer class="flex items-center justify-end gap-3 pt-4">
        <Button variant="outline" @click="emit('close')" :disabled="isPending"> Cancel </Button>
        <Button 
          variant="destructive" 
          @click="handleAction('REJECT')" 
          :disabled="isPending"
        > 
          Reject 
        </Button>
        <Button 
          variant="default" 
          @click="handleAction('APPROVE')" 
          :disabled="isPending"
        > 
          Approve 
        </Button>
      </footer>
    </div>
  </div>
</template>
