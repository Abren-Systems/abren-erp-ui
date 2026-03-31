import { ref } from 'vue'
import { apAdapter } from '../../infrastructure/adapter'

export function useValidateVendorBill(id: string) {
  const isValidating = ref(false)

  async function validate() {
    isValidating.value = true
    try {
      await apAdapter.validateBill(id)
    } catch (err: unknown) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Failed to validate bill')
    } finally {
      isValidating.value = false
    }
  }

  return { validate, isValidating }
}
