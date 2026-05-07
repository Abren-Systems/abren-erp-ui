import type { ScreenStatePolicy } from '@/platform/screen-runtime/screen-state-policy.types'

/**
 * CR102000 State Policy
 */
export const CR102000_POLICY: ScreenStatePolicy<'VIEW', string> = {
  states: {
    VIEW: {
      editable: false,
      fields: {},
    },
  },
}
