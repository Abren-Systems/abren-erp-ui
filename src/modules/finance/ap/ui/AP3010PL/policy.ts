import type { ScreenStatePolicy } from '@/platform/screen-runtime/screen-state-policy.types'

/**
 * AP3010PL State Policy
 */
export const AP3010PL_POLICY: ScreenStatePolicy<'LIST', string> = {
  states: {
    LIST: {
      editable: false,
      fields: {},
    },
  },
}
