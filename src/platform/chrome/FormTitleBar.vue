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
import { ArrowLeft } from 'lucide-vue-next'
import RecordServicesMenu from './RecordServicesMenu.vue'

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
        <button class="form-title-bar__breadcrumb" @click="goBack">
          {{ formTitle }}
        </button>
        <span class="form-title-bar__record-title">{{ recordTitle || 'New Record' }}</span>
      </div>
    </div>

    <div class="form-title-bar__services">
      <RecordServicesMenu />
    </div>
  </div>
</template>

<style scoped>
.form-title-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem var(--layout-gutter);
  border-bottom: 1px solid var(--color-neutral-200);
  background: #ffffff;
  min-height: 4rem;
}

.form-title-bar__left {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.form-title-bar__back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  margin-top: 0.25rem;
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
  flex-direction: column;
  gap: 0.125rem;
}

.form-title-bar__breadcrumb {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-primary-600, #2563eb);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: left;
}

.form-title-bar__breadcrumb:hover {
  text-decoration: underline;
}

.form-title-bar__record-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-neutral-900);
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

.form-title-bar__services {
  display: flex;
  align-items: center;
  gap: 0.125rem;
}
</style>
