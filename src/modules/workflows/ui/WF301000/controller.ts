import { computed, ref } from 'vue'
import { useScreenController } from '@/platform/screen-runtime'
import { WF301000 } from './screen'

export function useWorkflowInboxController() {
  const base = useScreenController<unknown, string>({
    screen: WF301000,
    dataSource: { entity: ref(null), isLoading: ref(false), error: ref(null) },
    isNew: computed(() => false),
    getDomainState: () => 'OPEN',
    statePolicy: {
      states: {
        OPEN: {
          editable: false,
        },
      },
    },
  })

  base.registerCommand('approve', {
    execute: async () => {},
    isPending: ref(false),
  })

  return {
    ...base,
  }
}
