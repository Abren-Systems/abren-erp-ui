import { computed, ref } from 'vue'
import {
  useScreenController,
  MAINTENANCE_SCREEN_POLICY,
  type BaseDomainState,
} from '@/platform/screen-runtime'
import { useFiscalCalendar } from '../../application/useFiscalCalendar'
import { GL101000 } from './screen'
import { GL101000_FIELDS } from './fields'
import { useRouter } from 'vue-router'

export function useFinancialYearController() {
  const { generateYear, isLoading, error } = useFiscalCalendar()
  const router = useRouter()

  // Generation state
  const genYear = ref('')
  const genStartDate = ref<string>('')
  const genEndDate = ref<string>('')

  // Initialize with current/next year
  const nextYear = new Date().getFullYear()
  genYear.value = String(nextYear)
  genStartDate.value = `${nextYear}-01-01`
  genEndDate.value = `${nextYear}-12-31`

  const base = useScreenController<unknown, BaseDomainState>({
    screen: GL101000,
    dataSource: {
      entity: computed(() => ({})),
      isLoading,
      error,
    },
    isNew: computed(() => true),
    getDomainState: () => 'DRAFT',
    statePolicy: MAINTENANCE_SCREEN_POLICY,
  })

  const isGenerateValid = computed(() => {
    return genYear.value.trim().length === 4 && !!genStartDate.value && !!genEndDate.value
  })

  base.registerCommand('generate', {
    execute: async () => {
      if (!isGenerateValid.value) return
      try {
        await generateYear({
          year: genYear.value,
          start_date: genStartDate.value,
          end_date: genEndDate.value,
        })
        // On success, navigate to the calendar to see the new year
        await router.push({ name: 'LedgerFiscalCalendar' })
      } catch {
        // Error handling via useFiscalCalendar
      }
    },
    isPending: isLoading,
  })

  return {
    ...base,
    fields: {
      genYear,
      genStartDate,
      genEndDate,
      registry: GL101000_FIELDS,
    },
    isGenerateValid,
    isLoading,
  }
}
