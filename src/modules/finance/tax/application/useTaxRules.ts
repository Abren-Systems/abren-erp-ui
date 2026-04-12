import { useQuery } from '@tanstack/vue-query'
import { TaxAdapter } from '../infrastructure/tax_adapter'
import type { TaxRule } from '../domain/tax.types'
import type { TaxRuleId } from '@/shared/types/brand.types'
import type { CalculateTaxRequest } from '../infrastructure/api.types'
import type { Ref } from 'vue'

export const taxKeys = {
  all: ['tax'] as const,
  rules: () => [...taxKeys.all, 'rules'] as const,
  ruleDetail: (id: string) => [...taxKeys.rules(), id] as const,
}

export function useActiveTaxRules() {
  return useQuery<TaxRule[]>({
    queryKey: taxKeys.rules(),
    queryFn: () => TaxAdapter.getActiveRules(),
  })
}

export function useTaxRule(ruleId: Ref<TaxRuleId | null>) {
  return useQuery<TaxRule | null>({
    queryKey: taxKeys.ruleDetail(ruleId.value as string),
    queryFn: () => (ruleId.value ? TaxAdapter.getRuleById(ruleId.value) : null),
    enabled: () => !!ruleId.value,
  })
}

// Keeping this simple for previews. In complex forms, we might use a mutation instead
// or a derived query based on reactive form state.
export function useTaxSimulation(payloadRef: Ref<CalculateTaxRequest | null>) {
  return useQuery({
    queryKey: [...taxKeys.all, 'simulate', payloadRef],
    queryFn: () => TaxAdapter.calculatePreviewTax(payloadRef.value!),
    enabled: () => !!payloadRef.value,
  })
}
