import { ref } from 'vue'
import type { ARInvoice, ARInvoiceLine } from '../domain/invoice.schema'

import { BusinessDate } from '@/shared/domain/business-date'

/**
 * AR Invoice Data Port
 *
 * Formalizes the interface for fetching and managing an AR Invoice,
 * decoupling the ScreenController from the simulated data layer.
 *
 * Currently acts as a stub repository.
 */
export function useARInvoice(id: string) {
  // eslint-disable-line no-restricted-syntax -- stub port, branded ID deferred
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const request = ref<ARInvoice | null>(null)

  // Simulation: Initialize a new entity if 'new' or a specific ID
  if (id === 'new') {
    request.value = {
      id: crypto.randomUUID(),
      docNumber: '<NEW>',
      status: 'Hold',
      date: BusinessDate.today(),
      customerId: '',
      currencyId: 'USD',
      docAmount: 0,
      lines: [],
    } as unknown as ARInvoice
  } else {
    // In a real implementation, this would fetch from TanStack Query
    request.value = {
      id,
      docNumber: 'INV-' + id.substring(0, 5),
      status: 'Open',
      date: BusinessDate.today(),
      customerId: 'CUST001',
      currencyId: 'USD',
      docAmount: 500,
      lines: [
        {
          id: crypto.randomUUID(),
          branchId: 'MAIN',
          inventoryId: 'ITEM1',
          description: 'Consulting Services',
          quantity: 1,
          uom: 'EA',
          unitPrice: 500,
          amount: 500,
          accountId: '4000',
          subaccountId: '000',
        } as ARInvoiceLine,
      ],
    } as unknown as ARInvoice
  }

  // Define patch/append/remove methods on the port to simulate a mutation layer
  // In a real system, these would be TanStack mutations or form patches
  const patch = (path: string, value: Partial<ARInvoice> | Partial<ARInvoiceLine>) => {
    if (!request.value) return

    // Simple mutation simulation for root properties
    if (path === '') {
      Object.assign(request.value, value)
      return
    }

    // Line mutation simulation
    if (path.startsWith('lines/')) {
      const index = parseInt(path.split('/')[1]!)
      if (!isNaN(index) && request.value.lines[index]) {
        Object.assign(request.value.lines[index], value)

        // Auto-recalculate line amount
        const line = request.value.lines[index]
        line.amount = line.quantity * line.unitPrice
      }
    }
  }

  const append = (path: string, item: ARInvoiceLine) => {
    if (!request.value) return
    if (path === 'lines') {
      request.value.lines.push(item)
    }
  }

  const remove = (path: string) => {
    if (!request.value) return
    if (path.startsWith('lines/')) {
      const index = parseInt(path.split('/')[1]!)
      if (!isNaN(index)) {
        request.value.lines.splice(index, 1)
      }
    }
  }

  return {
    request,
    isLoading,
    error,
    patch,
    append,
    remove,
  }
}
