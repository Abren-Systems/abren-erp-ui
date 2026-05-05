<script setup lang="ts">
/**
 * FormTitleBar — Platform chrome for the top of every data entry form.
 *
 * Renders:
 * - Back navigation button
 * - Form title (from screen.titleKey)
 * - Record title / identifier (from controller entity)
 * - Record services icon strip (Notes, Files, Activities, Settings)
 *
 * The record services buttons are currently placeholder — the backend
 * services don't exist yet. The chrome reserves the space.
 */
import { useRouter } from 'vue-router'
import { AppButton } from '@/shared/components/primitives'
import { ArrowLeft, StickyNote, Paperclip, Mail, Settings } from 'lucide-vue-next'

const props = defineProps<{
  /** Form title (e.g., "Payment Requests") */
  formTitle: string
  /** Record identifier (e.g., "PR-0042") */
  recordTitle?: string
  /** Named route to navigate back to (typically the PL screen) */
  backRoute?: string
}>()

const router = useRouter()

function goBack() {
  if (props.backRoute) {
    void router.push({ name: props.backRoute })
  } else {
    router.back()
  }
}
</script>

<template>
  <div class="form-title-bar">
    <div class="form-title-bar__left">
      <button class="form-title-bar__back" @click="goBack" aria-label="Go back">
        <ArrowLeft :size="16" />
      </button>

      <div class="form-title-bar__titles">
        <span class="form-title-bar__form-title">{{ formTitle }}</span>
        <template v-if="recordTitle">
          <span class="form-title-bar__separator">—</span>
          <span class="form-title-bar__record-title">{{ recordTitle }}</span>
        </template>
      </div>
    </div>

    <div class="form-title-bar__services">
      <button class="form-title-bar__service-btn" title="Notes" disabled aria-label="Notes">
        <StickyNote :size="16" />
      </button>
      <button class="form-title-bar__service-btn" title="Files" disabled aria-label="Attach files">
        <Paperclip :size="16" />
      </button>
      <button
        class="form-title-bar__service-btn"
        title="Activities"
        disabled
        aria-label="Activities"
      >
        <Mail :size="16" />
      </button>
      <button
        class="form-title-bar__service-btn"
        title="Settings"
        disabled
        aria-label="Form settings"
      >
        <Settings :size="16" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.form-title-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 1.5rem;
  border-bottom: 1px solid var(--color-neutral-200);
  background: var(--color-neutral-50);
  min-height: 2.75rem;
}

.form-title-bar__left {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.form-title-bar__back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  border: none;
  background: transparent;
  color: var(--color-neutral-500);
  cursor: pointer;
  transition: all 0.15s ease;
}

.form-title-bar__back:hover {
  background: var(--color-neutral-100);
  color: var(--color-neutral-900);
}

.form-title-bar__titles {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.form-title-bar__form-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-neutral-900);
}

.form-title-bar__separator {
  color: var(--color-neutral-400);
}

.form-title-bar__record-title {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-neutral-600);
  font-variant-numeric: tabular-nums;
}

.form-title-bar__services {
  display: flex;
  align-items: center;
  gap: 0.125rem;
}

.form-title-bar__service-btn {
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

.form-title-bar__service-btn:not(:disabled) {
  color: var(--color-neutral-500);
  cursor: pointer;
}

.form-title-bar__service-btn:not(:disabled):hover {
  background: var(--color-neutral-100);
  color: var(--color-neutral-900);
}
</style>
