import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { TaxAdapter } from '../infrastructure/tax.adapter'
import type { TaxRule, TaxGroup } from '../models/tax.types'
import type { TaxRuleId, TaxGroupId } from '@/shared/types/brand.types'
import type {
  CalculateTaxDTO,
  CreateTaxRuleDTO,
  CreateTaxGroupDTO,
} from '../infrastructure/api.types'
import { type Ref, computed } from 'vue'

export const taxKeys = {
  all: ['tax'] as const,
  rules: () => [...taxKeys.all, 'rules'] as const,
  ruleDetail: (id: string) => [...taxKeys.rules(), id] as const,
  groups: () => [...taxKeys.all, 'groups'] as const,
  groupDetail: (id: string) => [...taxKeys.groups(), id] as const,
}

export function useActiveTaxRules() {
  const query = useQuery<TaxRule[]>({
    queryKey: taxKeys.rules(),
    queryFn: () => TaxAdapter.getActiveRules(),
  })

  return {
    ...query,
    isLoading: computed(() => query.isLoading.value),
    error: computed(() => query.error.value),
  }
}

export function useTaxRule(ruleId: Ref<TaxRuleId | null>) {
  const query = useQuery<TaxRule | null>({
    queryKey: computed(() => taxKeys.ruleDetail(ruleId.value as string)),
    queryFn: () => (ruleId.value ? TaxAdapter.getRuleById(ruleId.value) : null),
    enabled: computed(() => !!ruleId.value && ruleId.value !== ('new' as unknown)),
  })

  return {
    ...query,
    isLoading: computed(() => query.isLoading.value),
    error: computed(() => query.error.value),
  }
}

export function useCreateTaxRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateTaxRuleDTO) => TaxAdapter.createTaxRule(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taxKeys.rules() })
    },
  })
}

export function useActiveTaxGroups() {
  const query = useQuery<TaxGroup[]>({
    queryKey: taxKeys.groups(),
    queryFn: () => TaxAdapter.getActiveGroups(),
  })

  return {
    ...query,
    isLoading: computed(() => query.isLoading.value),
    error: computed(() => query.error.value),
  }
}

export function useTaxGroup(groupId: Ref<TaxGroupId | null>) {
  const query = useQuery<TaxGroup | null>({
    queryKey: computed(() => taxKeys.groupDetail(groupId.value as string)),
    queryFn: () => (groupId.value ? TaxAdapter.getGroupById(groupId.value) : null),
    enabled: computed(() => !!groupId.value && groupId.value !== ('new' as unknown)),
  })

  return {
    ...query,
    isLoading: computed(() => query.isLoading.value),
    error: computed(() => query.error.value),
  }
}

export function useCreateTaxGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateTaxGroupDTO) => TaxAdapter.createTaxGroup(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taxKeys.groups() })
    },
  })
}

export function useTaxSimulation(payloadRef: Ref<CalculateTaxDTO | null>) {
  return useQuery({
    queryKey: [...taxKeys.all, 'simulate', payloadRef],
    queryFn: () => TaxAdapter.calculatePreviewTax(payloadRef.value!),
    enabled: computed(() => !!payloadRef.value),
  })
}
