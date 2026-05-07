import type { ScreenStatePolicy } from '@/platform/screen-runtime/screen-state-policy.types'

/**
 * WF301000 State Policy
 */
export const WF301000_POLICY: ScreenStatePolicy<'INBOX', string> = {
  states: {
    INBOX: {
      editable: false,
      fields: {},
    },
  },
}
