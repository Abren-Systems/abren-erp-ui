import { ref, computed, watch } from 'vue'
import { useScreenController } from '@/platform/screen-runtime/useScreenController'
import { transitionRecorder } from '@/platform/debug/transition-recorder'
import { AR301000 } from './definition'
import { ARInvoiceStatePolicy } from './state-policy'
import type { ARInvoice, ARDocumentStatus, ARInvoiceLine } from '../../domain/invoice.schema'

/**
 * useARInvoiceController
 *
 * Local simulation of the AR301000 screen logic.
 * Since the backend is missing, we manage the 'entity' state locally.
 */
export function useARInvoiceController(docNumber?: string) {
  // ── Local Simulation State (The "Backend" for now) ──
  const entity = ref<ARInvoice>({
    id: crypto.randomUUID(),
    docType: 'INV',
    docNumber: docNumber || 'NEW',
    status: 'Hold',
    date: new Date().toISOString(),
    postPeriod: '05-2026',
    customerId: 'CUST001',
    customerLocationId: 'MAIN',
    currencyId: 'USD',
    docAmount: 0,
    balance: 0,
    lines: [],
    availableActions: ['release'],
  })

  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  // ── Semantic Aggregation ──
  // In a real system, the resolver would do this. Here we simulate it.
  const totals = computed(() => {
    const subtotal = entity.value.lines.reduce((sum, line) => sum + line.amount, 0)
    return { subtotal, total: subtotal }
  })

  // Sync totals back to entity for projection
  // (In simulation, we "cheat" slightly to keep the entity in sync with semantic derivations)
  watch(totals, (t) => {
    entity.value.docAmount = t.total
    entity.value.balance = t.total
  })

  // ── Controller Integration ──
  const controller = useScreenController<ARInvoice, ARDocumentStatus>({
    screen: AR301000,
    statePolicy: ARInvoiceStatePolicy,
    dataSource: {
      entity,
      isLoading,
      error,
    },
    getDomainState: (doc) => doc.status,
  })

  // ── Grid Commands ──

  const addLine = async () => {
    const newLine: ARInvoiceLine = {
      id: crypto.randomUUID(),
      branchId: 'HEAD',
      description: 'New Line Item',
      quantity: 1,
      uom: 'EA',
      unitPrice: 0,
      amount: 0,
      accountId: '40000',
      subaccountId: '000-000',
    }

    entity.value.lines.push(newLine)

    transitionRecorder.recordTransition(
      { type: 'mutation', source: 'ARGrid.addLine' },
      { operations: [{ op: 'append', path: 'lines', value: newLine }] },
      [],
      controller.model.value.version,
    )
  }

  const updateLine = (index: number, patch: Partial<ARInvoiceLine>) => {
    const line = entity.value.lines[index]
    if (!line) return

    Object.assign(line, patch)

    // Recalculate amount if qty/price changed
    if ('quantity' in patch || 'unitPrice' in patch) {
      line.amount = line.quantity * line.unitPrice
    }

    transitionRecorder.recordTransition(
      { type: 'mutation', source: `ARGrid.updateLine(${index})` },
      {
        operations: Object.entries(patch).map(([key, value]) => ({
          op: 'replace',
          path: `lines/${index}/${key}`,
          value,
        })),
      },
      [],
      controller.model.value.version,
    )
  }

  const removeLine = (index: number) => {
    entity.value.lines.splice(index, 1)

    transitionRecorder.recordTransition(
      { type: 'mutation', source: `ARGrid.removeLine(${index})` },
      { operations: [{ op: 'remove', path: `lines/${index}` }] },
      [],
      controller.model.value.version,
    )
  }

  // ── Workflow Commands ──

  const release = async () => {
    isLoading.value = true
    await new Promise((resolve) => setTimeout(resolve, 800))
    entity.value.status = 'Released'
    entity.value.availableActions = ['reverse']
    isLoading.value = false
  }

  // Register commands
  controller.registerCommand('release', { execute: release, isPending: isLoading })
  controller.registerCommand('addLine', { execute: addLine, isPending: isLoading })

  return {
    ...controller,
    updateLine,
    removeLine,
    totals,
    isReleased: computed(() => entity.value.status === 'Released'),
  }
}
