<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { UploadCloud, File, X } from 'lucide-vue-next'
import { AppButton } from '@/shared/components/primitives'

const props = defineProps<{
  accept?: string
  maxSizeMB?: number
}>()

const emit = defineEmits<{
  (e: 'file-selected', file: File): void
  (e: 'file-cleared'): void
}>()

const isDragging = ref(false)
const selectedFile = ref<File | null>(null)
const errorMsg = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

function handleDragEnter(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    processFile(target.files[0])
  }
}

function processFile(file: File) {
  errorMsg.value = ''

  if (props.maxSizeMB && file.size > props.maxSizeMB * 1024 * 1024) {
    errorMsg.value = `File exceeds maximum size of ${props.maxSizeMB}MB.`
    return
  }

  // Basic accept check (could be expanded)
  if (props.accept && !file.type.match(props.accept.replace('/*', '.*'))) {
    errorMsg.value = `Invalid file type. Accepted: ${props.accept}`
    return
  }

  selectedFile.value = file
  emit('file-selected', file)
}

function clearFile() {
  selectedFile.value = null
  errorMsg.value = ''
  emit('file-cleared')
}

const preventDefault = (e: Event) => e.preventDefault()

onMounted(() => {
  window.addEventListener('dragover', preventDefault)
  window.addEventListener('drop', preventDefault)
})

onUnmounted(() => {
  window.removeEventListener('dragover', preventDefault)
  window.removeEventListener('drop', preventDefault)
})
</script>

<template>
  <div class="w-full">
    <div
      v-if="!selectedFile"
      class="relative flex cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed p-8 transition-colors"
      :class="[
        isDragging
          ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]/50'
          : 'border-[var(--color-neutral-300)] bg-[var(--color-neutral-50)]/30 hover:bg-[var(--color-neutral-50)]/50 hover:border-[var(--color-neutral-400)]',
      ]"
      @dragenter="handleDragEnter"
      @dragover="handleDragEnter"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @click="fileInput?.click()"
    >
      <input
        ref="fileInput"
        type="file"
        class="hidden"
        :accept="accept"
        @change="handleFileSelect"
      />
      <div class="p-3 bg-white rounded-sm border border-[var(--color-neutral-200)] shadow-sm mb-4">
        <UploadCloud class="h-6 w-6 text-[var(--color-primary-600)]" />
      </div>
      <p class="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--color-neutral-900)]">
        Upload Document
      </p>
      <p class="text-[10px] font-medium text-[var(--color-neutral-500)] uppercase tracking-tight">
        Click or drag & drop {{ accept ? accept.split(',').join(', ') : 'files' }}
        {{ maxSizeMB ? `(up to ${maxSizeMB}MB)` : '' }}
      </p>
    </div>

    <!-- Selected File Preview -->
    <div
      v-else
      class="flex items-center justify-between rounded-sm border border-[var(--color-neutral-200)] bg-white p-3 pr-2 shadow-sm"
    >
      <div class="flex items-center space-x-3 overflow-hidden">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-[var(--color-primary-50)] text-[var(--color-primary-600)]"
        >
          <File class="h-5 w-5" />
        </div>
        <div class="overflow-hidden">
          <p class="truncate text-xs font-bold text-[var(--color-neutral-900)]">
            {{ selectedFile.name }}
          </p>
          <p class="text-[10px] font-mono text-[var(--color-neutral-500)]">{{ (selectedFile.size / 1024).toFixed(1) }} KB</p>
        </div>
      </div>
      <AppButton
        variant="stealth"
        class="h-8 w-8 p-0 text-[var(--color-neutral-400)] hover:text-[var(--color-danger-600)]"
        @click="clearFile"
      >
        <X class="h-4 w-4" />
      </AppButton>
    </div>

    <p v-if="errorMsg" class="mt-2 text-[10px] font-bold uppercase text-[var(--color-danger-600)] tracking-tight">
      {{ errorMsg }}
    </p>
  </div>
</template>
