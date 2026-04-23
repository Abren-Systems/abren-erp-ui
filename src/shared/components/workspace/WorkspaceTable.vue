<script setup lang="ts">
 /**
 * WorkspaceTable — High-Density Ledger Table.
 * A specialized wrapper for list data that requires maximum density and financial trust.
 */
</script>

<template>
  <div
    class="overflow-hidden rounded-xl border border-[color:var(--color-neutral-200)] bg-white shadow-sm"
  >
    <div class="overflow-x-auto">
      <table class="min-w-full text-[13px] leading-none">
        <thead
          class="bg-[var(--color-neutral-50)] border-b border-[color:var(--color-neutral-200)]"
        >
          <slot name="header" />
        </thead>
        <tbody class="divide-y divide-[var(--color-neutral-100)]">
          <slot name="body" />
        </tbody>
        <tfoot
          v-if="$slots['footer']"
          class="bg-[var(--color-neutral-50)]/50 border-t border-[color:var(--color-neutral-200)]"
        >
          <slot name="footer" />
        </tfoot>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* Force high density on slotted cells if they don't provide their own padding */
:deep(th),
:deep(td) {
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.625rem;
  padding-bottom: 0.625rem;
}

:deep(th) {
  text-align: left;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--color-neutral-500);
  white-space: nowrap;
}

:deep(tr:hover td) {
  background-color: rgba(var(--color-neutral-50-rgb), 0.5);
}
</style>
