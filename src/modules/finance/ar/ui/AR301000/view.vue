<script setup lang="ts">
import { useScreenControllerContext } from '@/platform/screen-runtime'
import type { useARInvoiceController } from './controller'
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
 * Safely injects the controller and automatically unwraps the ref,
 * enforcing the ScreenRenderer boundary constraint.
 */
const ctrl = useScreenControllerContext<ReturnType<typeof useARInvoiceController>>()
</script>

<template>
  <AppTemplate :controller="ctrl">
    <template #header>
      <AppFieldset title="Document Summary">
        <div class="header-grid">
          <AppField v-bind="ctrl.fields.status" :semantic="SemanticKind.Status" />
          <AppField v-bind="ctrl.fields.customerId" />
          <AppField v-bind="ctrl.fields.date" />
          <AppField v-bind="ctrl.fields.currencyId" />
          <AppField v-bind="ctrl.fields.docAmount" :semantic="SemanticKind.Money" />
        </div>
      </AppFieldset>
    </template>

    <template #default>
      <div class="ar-invoice-content">
        <AppFieldset title="Details">
          <!-- 
            GRID RENDERER
            Strictly consumes state from the deterministic projection `ctrl.model.value.ui.grids.state`
            and dispatches intents back to the controller via Vue emits.
          -->
          <ARInvoiceGrid
            :lines="ctrl.model.value.ui.grids.state.lines as any[]"
            :readonly="!ctrl.model.value.domain.capabilities.canEdit"
            @update="ctrl.updateLine"
            @remove="ctrl.removeLine"
            @add="ctrl.addLine"
          />
        </AppFieldset>

        <div class="totals-section">
          <div class="totals-card">
            <!-- 
              SEMANTIC AGGREGATES
              Also consumed purely from the projection grids state to maintain
              topological purity (View only reads Projection).
            -->
            <div class="total-row">
              <span>Subtotal:</span>
              <span class="font-mono">
                <!-- Using basic formatting here, ideally handled by a semantic component -->
                {{ (ctrl.model.value.ui.grids.state.totals as any).subtotal }}
              </span>
            </div>
            <div class="total-row grand-total">
              <span>Total:</span>
              <span class="font-mono">
                {{ (ctrl.model.value.ui.grids.state.totals as any).total }}
              </span>
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
