import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { TaxAdapter } from '../infrastructure/tax.adapter'
import type { TaxRule, TaxGroup } from '../domain/tax.types'
import type { TaxRuleId } from '@/shared/types/brand.types'
import type {
  CalculateTaxRequest,
  TaxRuleCreateDTO,
  TaxGroupCreateDTO,
} from '../infrastructure/api.types'
import type { Ref } from 'vue'

export const taxKeys = {
  all: ['tax'] as const,
  rules: () => [...taxKeys.all, 'rules'] as const,
  ruleDetail: (id: string) => [...taxKeys.rules(), id] as const,
  groups: () => [...taxKeys.all, 'groups'] as const,
  groupDetail: (id: string) => [...taxKeys.groups(), id] as const,
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

export function useCreateTaxRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: TaxRuleCreateDTO) => TaxAdapter.createTaxRule(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taxKeys.rules() })
    },
  })
}

export function useActiveTaxGroups() {
  return useQuery<TaxGroup[]>({
    queryKey: taxKeys.groups(),
    queryFn: () => TaxAdapter.getActiveGroups(),
  })
}

export function useCreateTaxGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: TaxGroupCreateDTO) => TaxAdapter.createTaxGroup(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taxKeys.groups() })
    },
  })
}

export function useTaxSimulation(payloadRef: Ref<CalculateTaxRequest | null>) {
  return useQuery({
    queryKey: [...taxKeys.all, 'simulate', payloadRef],
    queryFn: () => TaxAdapter.calculatePreviewTax(payloadRef.value!),
    enabled: () => !!payloadRef.value,
  })
}
