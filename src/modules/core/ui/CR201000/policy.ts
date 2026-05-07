import type { ScreenStatePolicy } from '@/platform/screen-runtime/screen-state-policy.types'

/**
 * CR201000 State Policy
 */
export const CR201000_POLICY: ScreenStatePolicy<'VIEW', string> = {
  states: {
    VIEW: {
      editable: false,
      fields: {},
    },
  },
}
