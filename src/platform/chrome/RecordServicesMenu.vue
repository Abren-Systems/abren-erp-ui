<script setup lang="ts">
/**
 * RecordServicesMenu.vue
 *
 * Platform-level record services chrome. These are cross-cutting capabilities
 * attached to a specific record (Notes, Files, Activities, Settings).
 * This component formalizes these as explicit platform services rather than
 * random module buttons.
 */
import { StickyNote, Paperclip, Mail, Settings } from 'lucide-vue-next'

// These will eventually receive the active `ScreenModel` or record ID
// to resolve whether they have data (e.g., a badge showing "3 Files").
// For Phase 1, they are structurally formalized but disabled.
</script>

<template>
  <div class="record-services">
    <button class="record-services__btn" title="Notes" disabled aria-label="Notes">
      <StickyNote :size="16" />
    </button>
    <button class="record-services__btn" title="Files" disabled aria-label="Attach files">
      <Paperclip :size="16" />
    </button>
    <button
      class="record-services__btn"
      title="Activities"
      disabled
      aria-label="Activities"
    >
      <Mail :size="16" />
    </button>
    <button
      class="record-services__btn"
      title="Settings"
      disabled
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
}

.record-services__btn:not(:disabled) {
  color: var(--color-neutral-500);
  cursor: pointer;
}

.record-services__btn:not(:disabled):hover {
  background: var(--color-neutral-100);
  color: var(--color-neutral-900);
}
</style>
