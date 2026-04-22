import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { TaxAdapter } from '../infrastructure/tax_adapter'
import { taxKeys } from './useTaxRules'
import type { TaxRuleCreateDTO } from '../infrastructure/api.types'

/**
 * Use Case: Create Tax Rule.
 *
 * Provides a mutation for registering new tax rules and invalidating the rules list.
 */
export function useCreateTaxRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: TaxRuleCreateDTO) => TaxAdapter.createTaxRule(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taxKeys.rules() })
    },
  })
}
