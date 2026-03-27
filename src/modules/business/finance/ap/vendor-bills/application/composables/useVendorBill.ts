import { ref, onMounted, computed } from 'vue'
import { useVendorBillsStore } from '../store/useVendorBillsStore'
import type { VendorBillDTO } from '../../infrastructure/api.types'

export function useVendorBill(id: string) {
  const store = useVendorBillsStore()
  const bill = ref<VendorBillDTO | null>(null)
  const isLoading = ref(true)

  onMounted(async () => {
    bill.value = await store.fetchBill(id)
    isLoading.value = false
  })

  async function validate() {
    try {
      await store.validateBill(id)
      bill.value = store.currentBill
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to validate vendor bill')
    }
  }

  return {
    bill,
    isLoading,
    validate,
    isActionPending: computed(() => store.isLoading),
  }
}
