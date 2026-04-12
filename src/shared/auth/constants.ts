/**
 * Shared Authentication Constants
 *
 * Prevents key desynchronization between the Axios HTTP client
 * and the Pinia Auth Store.
 */

export const AUTH_KEYS = {
  ACCESS_TOKEN: 'abren_access_token',
  REFRESH_TOKEN: 'abren_refresh_token',
} as const
