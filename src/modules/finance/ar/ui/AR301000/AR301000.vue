<script setup lang="ts">
import { inject } from 'vue'
import { ScreenControllerKey } from '@/platform/screen-runtime/injection-keys'
import type { useARInvoiceController } from './controller'
import { useField } from '@/platform/field-system/bindings/useField'
import AppTemplate from '@/platform/chrome/AppTemplate.vue'
import AppFieldset from '@/shared/components/field-system/AppFieldset.vue'
import AppField from '@/shared/components/field-system/AppField.vue'
import ARInvoiceGrid from './invoice-grid.vue'
import { SemanticKind } from '@/platform/semantic-runtime/contracts'

const props = defineProps<{
  id?: string
}>()

/**
 * AUTHORITATIVE INJECTION
 *
 * We no longer instantiate the controller here. We 'inject' it from
 * the ScreenRenderer (Stage C). This satisfies EOI-01.
 */
const controller = inject(ScreenControllerKey) as ReturnType<typeof useARInvoiceController>

if (!controller) {
  throw new Error('[AR301000] Controller not provided by platform.')
}

// ── Field Bindings ──
const customerId = useField(controller, { key: 'customerId', type: 'text', label: 'Customer ID' })
const docDate = useField(controller, { key: 'date', type: 'date', label: 'Date' })
const currency = useField(controller, { key: 'currencyId', type: 'text', label: 'Currency' })
const amount = useField(controller, { key: 'docAmount', type: 'number', label: 'Total Amount' })
const status = useField(controller, { key: 'status', type: 'text', label: 'Status' })
</script>

<template>
  <AppTemplate :controller="controller">
    <template #header>
      <AppFieldset title="Document Summary">
        <div class="header-grid">
          <AppField v-bind="status" :semantic="SemanticKind.Status" />
          <AppField v-bind="customerId" />
          <AppField v-bind="docDate" />
          <AppField v-bind="currency" />
          <AppField v-bind="amount" :semantic="SemanticKind.Money" />
        </div>
      </AppFieldset>
    </template>

    <template #default>
      <div class="ar-invoice-content">
        <AppFieldset title="Details">
          <ARInvoiceGrid
            :lines="controller.dataSource.entity.value.lines"
            :readonly="controller.isReleased.value"
            @update="controller.updateLine"
            @remove="controller.removeLine"
            @add="controller.addLine"
          />
        </AppFieldset>

        <div class="totals-section">
          <div class="totals-card">
            <div class="total-row">
              <span>Subtotal:</span>
              <span class="font-mono">{{
                controller.totals.value.subtotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })
              }}</span>
            </div>
            <div class="total-row grand-total">
              <span>Total:</span>
              <span class="font-mono">{{
                controller.totals.value.total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </AppTemplate>
</template>

<style scoped>
.header-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.ar-invoice-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.totals-section {
  display: flex;
  justify-content: flex-end;
}

.totals-card {
  width: 300px;
  background: var(--color-neutral-50);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--color-neutral-200);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--color-neutral-600);
}

.grand-total {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-neutral-900);
  border-top: 1px solid var(--color-neutral-200);
  padding-top: 0.75rem;
}

.font-mono {
  font-family: var(--font-mono);
}
</style>
