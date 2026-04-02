import { apiGet, httpClient } from '@/shared/api/http-client'
import type { ApiResponse } from '@/shared/api/http-client'
import type { LoginResponseDTO, TenantInfoDTO, UserProfileDTO } from './api.types'

/**
 * Auth API Adapter.
 *
 * Provides typed HTTP methods for interacting with core identity and session endpoints.
 * Operates purely on Data Transfer Objects (DTOs) representing raw server output.
 */
export const authAdapter = {
  /**
   * Submits user credentials to establish a session.
   * Note: The backend sets HttpOnly cookies. This client only receives success confirmation.
   *
   * @param email - User's email/username.
   * @param password - User's plaintext password.
   * @returns A promise resolving to the raw login response.
   */
  async login(email: string, password: string): Promise<LoginResponseDTO> {
    const formData = new URLSearchParams()
    formData.set('username', email)
    formData.set('password', password)

    const response = await httpClient.post<ApiResponse<LoginResponseDTO>>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    return response.data.data
  },

  /**
   * Fetches the profile data for the authenticated user session.
   *
   * @returns A promise resolving to the raw UserProfileDTO.
   */
  async getCurrentUser(): Promise<UserProfileDTO> {
    return apiGet<UserProfileDTO>('/core/users/me')
  },

  /**
   * Fetches the tenant configuration and active feature flags for the current session.
   *
   * @returns A promise resolving to the raw TenantInfoDTO.
   */
  async getCurrentTenant(): Promise<TenantInfoDTO> {
    return apiGet<TenantInfoDTO>('/core/tenants/current')
  },
}
