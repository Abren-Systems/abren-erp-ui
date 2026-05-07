<script setup lang="ts">
/**
 * ListTitleBar — Platform chrome for list/processing screens.
 *
 * Distinct from FormTitleBar:
 * - No back button (list screens are top-level workspace destinations)
 * - No record title (no single record context)
 * - No record services strip (Notes, Files, Activities apply to records, not lists)
 *
 * In Acumatica's Modern UI, Generic Inquiry and Processing screens use a
 * lighter title bar without form-level chrome. This component enforces
 * that distinction in the Abren ERP platform layer.
 */
defineProps<{
  /** Screen title (e.g., "Payment Requests", "Warehouses") */
  screenTitle: string
}>()
</script>

<template>
  <div class="list-title-bar">
    <span class="list-title-bar__title">{{ screenTitle }}</span>
    <slot name="actions" />
  </div>
</template>

<style scoped>
.list-title-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 1.5rem;
  border-bottom: 1px solid var(--color-neutral-200);
  background: var(--color-neutral-50);
  min-height: 2.75rem;
}

.list-title-bar__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-neutral-900);
}
</style>
