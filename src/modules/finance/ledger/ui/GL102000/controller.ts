import { computed, ref } from 'vue'
import { useScreenController } from '@/platform/screen-runtime'
import { GL102000 } from './screen'

export function useFiscalPeriodsController() {
  const base = useScreenController<unknown, string>({
    screen: GL102000,
    dataSource: { entity: ref(null), isLoading: ref(false), error: ref(null) },
    isNew: computed(() => false),
    getDomainState: () => 'OPEN',
    statePolicy: {
      states: {
        OPEN: {
          editable: true,
        },
      },
    },
  })

  base.registerCommand('save', {
    execute: async () => {},
    isPending: ref(false),
  })

  return {
    ...base,
  }
}
