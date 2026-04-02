import { apiGet } from '@/shared/api/http-client'
import type { UserDTO } from './api.types'

/**
 * Core API Adapter.
 *
 * Provides typed HTTP methods for interacting with core identity and tenant services.
 */
export const coreAdapter = {
  /**
   * Fetches the list of all users within the current tenant.
   *
   * @returns A promise resolving to an array of UserDTOs.
   */
  async listUsers(): Promise<UserDTO[]> {
    return apiGet<UserDTO[]>('/core/users')
  },
}
