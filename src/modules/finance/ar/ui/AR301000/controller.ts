import { computed, ref } from 'vue'
import { useScreenController } from '@/platform/screen-runtime'
import { AR301000 } from './screen'
import { ARInvoiceStatePolicy } from './state-policy'
import type { ARInvoice, ARDocumentStatus, ARInvoiceLine } from '../../domain/invoice.schema'
import { useARInvoice } from '../../application/useARInvoice'
import { AR301000_FIELDS } from './fields'
import { useField } from '@/platform/field-system/bindings/useField'

/**
 * AR INVOICE CONTROLLER (Runtime Boundary & Orchestration)
 */
export function useARInvoiceController(id: string) {
  const isNew = computed(() => id === 'new')

  // ── Data Port ──
  const { request: entity, isLoading, error, patch, append, remove } = useARInvoice(id)

  // ── Semantic Aggregates ─────────────────────────────────────
  // Computed *before* base controller so we can inject into projection grids
  const totals = computed(() => {
    const lines = entity.value?.lines || []
    const subtotal = lines.reduce((sum, l) => sum + (l.amount || 0), 0)
    return {
      subtotal,
      tax: 0,
      total: subtotal,
    }
  })

  // ── Platform Base ──
  const base = useScreenController<ARInvoice, ARDocumentStatus>({
    screen: AR301000,
    dataSource: { entity, isLoading, error },
    isNew,
    getDomainState: (ent) => ent.status,
    statePolicy: ARInvoiceStatePolicy,
    grids: computed(() => ({
      lines: entity.value?.lines || [],
      totals: totals.value,
    })),
  })

  // ── Workflow Action Executors ──
  // Using dummy async functions for now since there's no backend
  const release = async () => {
    patch('', { status: 'Released' })
  }
  const reverse = async () => {
    // In reality this would create a new document
    // TODO: Create reversal document via backend
  }
  const voidDoc = async () => {
    patch('', { status: 'Voided' })
  }

  // Pending states for commands
  const isReleasing = ref(false)
  const isReversing = ref(false)
  const isVoiding = ref(false)

  base.registerCommand('release', {
    execute: async () => {
      isReleasing.value = true
      try {
        await release()
      } finally {
        isReleasing.value = false
      }
    },
    isPending: isReleasing,
  })

  base.registerCommand('reverse', {
    execute: async () => {
      isReversing.value = true
      try {
        await reverse()
      } finally {
        isReversing.value = false
      }
    },
    isPending: isReversing,
  })

  base.registerCommand('void', {
    execute: async () => {
      isVoiding.value = true
      try {
        await voidDoc()
      } finally {
        isVoiding.value = false
      }
    },
    isPending: isVoiding,
  })

  // ── Mutators (Intents from Grid) ───────────────────
  const updateLine = (index: number, linePatch: Partial<ARInvoiceLine>) => {
    patch(`lines/${index}`, linePatch)
    // Synchronize docAmount semantic logic when line changes
    // In a real CQRS system, the backend performs this recalculation
    if (entity.value) {
      patch('', { docAmount: totals.value.total })
    }
  }

  const addLine = () => {
    append('lines', {
      id: crypto.randomUUID(),
      branchId: 'MAIN',
      inventoryId: '',
      description: '',
      quantity: 1,
      uom: 'EA',
      unitPrice: 0,
      amount: 0,
      accountId: '',
      subaccountId: '',
    })
    if (entity.value) {
      patch('', { docAmount: totals.value.total })
    }
  }

  const removeLine = (index: number) => {
    remove(`lines/${index}`)
    if (entity.value) {
      patch('', { docAmount: totals.value.total })
    }
  }

  // ── Field Bindings ──────────────────────────────────────
  const fields = {
    customerId: useField(base, AR301000_FIELDS.customerId),
    date: useField(base, AR301000_FIELDS.date),
    currencyId: useField(base, AR301000_FIELDS.currencyId),
    docAmount: useField(base, AR301000_FIELDS.docAmount),
    status: useField(base, AR301000_FIELDS.status),
  }

  return {
    ...base,
    fields,
    updateLine,
    addLine,
    removeLine,
  }
}
