<script setup lang="ts">
/**
 * RecordServicesMenu.vue
 *
 * Platform-level record services chrome. These are cross-cutting capabilities
 * attached to a specific record (Notes, Files, Activities, Settings).
 * This component formalizes these as explicit platform services rather than
 * random module buttons.
 */
import { inject, computed } from 'vue'
import { StickyNote, Paperclip, Mail, Settings } from 'lucide-vue-next'
import { ScreenControllerKey } from '../screen-runtime'

const ctrl = inject(ScreenControllerKey, null)

const services = computed(() => {
  return (
    ctrl?.value?.model?.value?.domain?.services ?? {
      hasNotes: false,
      fileCount: 0,
      hasActivities: false,
    }
  )
})

const isNew = computed(() => ctrl?.value?.isNew.value ?? true)
const isSettingsEnabled = computed(() => !isNew.value)
</script>

<template>
  <div class="record-services">
    <button
      class="record-services__btn"
      title="Notes"
      :disabled="isNew"
      aria-label="Notes"
      :class="{ 'has-data': services.hasNotes }"
    >
      <StickyNote :size="16" />
    </button>
    <button
      class="record-services__btn"
      title="Files"
      :disabled="isNew"
      aria-label="Attach files"
      :class="{ 'has-data': services.fileCount > 0 }"
    >
      <Paperclip :size="16" />
      <span v-if="services.fileCount > 0" class="badge">{{ services.fileCount }}</span>
    </button>
    <button
      class="record-services__btn"
      title="Activities"
      :disabled="isNew"
      aria-label="Activities"
      :class="{ 'has-data': services.hasActivities }"
    >
      <Mail :size="16" />
    </button>
    <button
      class="record-services__btn"
      title="Settings"
      :disabled="!isSettingsEnabled"
      aria-label="Form settings"
    >
      <Settings :size="16" />
    </button>
  </div>
</template>

<style scoped>
.record-services {
  display: flex;
  align-items: center;
  gap: 0.125rem;
}

.record-services__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  border: none;
  background: transparent;
  color: var(--color-neutral-400);
  cursor: not-allowed;
  transition: all 0.15s ease;
  position: relative;
}

.record-services__btn:not(:disabled) {
  color: var(--color-neutral-500);
  cursor: pointer;
}

.record-services__btn:not(:disabled):hover {
  background: var(--color-neutral-100);
  color: var(--color-neutral-900);
}

.record-services__btn.has-data {
  color: var(--color-primary-600);
}

.badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: var(--color-primary-600);
  color: white;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0 0.25rem;
  border-radius: 9999px;
  line-height: 1.2;
}
</style>
