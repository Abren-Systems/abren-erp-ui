<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { UploadCloud, File, X } from 'lucide-vue-next'
import { Button } from '@/shared/components/button'

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

onMounted(() => {
  window.addEventListener('dragover', (e) => e.preventDefault())
  window.addEventListener('drop', (e) => e.preventDefault())
})

onUnmounted(() => {
  window.removeEventListener('dragover', (e) => e.preventDefault())
  window.removeEventListener('drop', (e) => e.preventDefault())
})
</script>

<template>
  <div class="w-full">
    <div
      v-if="!selectedFile"
      class="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors"
      :class="[
        isDragging
          ? 'border-blue-500 bg-blue-50/50'
          : 'border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900/50',
      ]"
      @dragenter="handleDragEnter"
      @dragover="handleDragEnter"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @click="$refs.fileInput.click()"
    >
      <input
        ref="fileInput"
        type="file"
        class="hidden"
        :accept="accept"
        @change="handleFileSelect"
      />
      <UploadCloud class="mb-3 h-8 w-8 text-neutral-400" />
      <p class="mb-1 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
        Click to upload or drag and drop
      </p>
      <p class="text-xs text-neutral-500">
        {{ accept ? accept.split(',').join(', ') : 'Any file' }}
        {{ maxSizeMB ? `(up to ${maxSizeMB}MB)` : '' }}
      </p>
    </div>

    <!-- Selected File Preview -->
    <div
      v-else
      class="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-3 pr-2 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div class="flex items-center space-x-3 overflow-hidden">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
        >
          <File class="h-5 w-5" />
        </div>
        <div class="overflow-hidden">
          <p class="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {{ selectedFile.name }}
          </p>
          <p class="text-xs text-neutral-500">{{ (selectedFile.size / 1024).toFixed(1) }} KB</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8 text-neutral-500 hover:text-destructive"
        @click="clearFile"
      >
        <X class="h-4 w-4" />
      </Button>
    </div>

    <p v-if="errorMsg" class="mt-2 text-xs font-medium text-destructive">
      {{ errorMsg }}
    </p>
  </div>
</template>
