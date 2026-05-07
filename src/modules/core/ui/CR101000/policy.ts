import type { ScreenStatePolicy } from '@/platform/screen-runtime/screen-state-policy.types'

/**
 * CR101000 State Policy
 */
export const CR101000_POLICY: ScreenStatePolicy<'VIEW', string> = {
  states: {
    VIEW: {
      editable: false,
      fields: {},
    },
  },
}
