import { ref } from 'vue'
import { defineStore } from 'pinia'
import { vendorBillsAdapter } from '../../infrastructure/vendor_bills_adapter'
import type { VendorBillDTO } from '../../infrastructure/api.types'

export const useVendorBillsStore = defineStore('vendorBills', () => {
  const bills = ref<VendorBillDTO[]>([])
  const currentBill = ref<VendorBillDTO | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchBills = async () => {
    isLoading.value = true
    error.value = null
    try {
      bills.value = await vendorBillsAdapter.list()
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch vendor bills'
    } finally {
      isLoading.value = false
    }
  }

  const fetchBill = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      currentBill.value = await vendorBillsAdapter.get(id)
      return currentBill.value
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch vendor bill'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const validateBill = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      const validated = await vendorBillsAdapter.validate(id)
      currentBill.value = validated

      const index = bills.value.findIndex((b) => b.id === id)
      if (index !== -1) {
        bills.value[index] = validated
      }
      return validated
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to validate vendor bill'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    bills,
    currentBill,
    isLoading,
    error,
    fetchBills,
    fetchBill,
    validateBill,
  }
})
