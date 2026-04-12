export interface LoginResponseDTO {
  message?: string;
}

export interface UserProfileDTO {
  id: string;
  tenant_id: string;
  email: string;
  is_active: boolean;
  permissions: string[];
}

export interface TenantInfoDTO {
  id: string;
  name: string;
  features: Record<string, boolean>;
}
