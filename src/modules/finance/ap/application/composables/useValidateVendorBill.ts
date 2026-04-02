import { ref } from 'vue'
import { apAdapter } from '../../infrastructure/ap_adapter'

/**
 * Use Case: Validate a Vendor Bill.
 *
 * Transitions a draft vendor bill to the validated/posted state.
 *
 * @param id - The unique identifier of the vendor bill to validate.
 * @returns Reactive validation state and trigger function.
 * @example
 * const { validate, isValidating } = useValidateVendorBill('bill_123')
 */
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
