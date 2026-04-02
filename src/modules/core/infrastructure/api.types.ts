export interface UserDTO {
  id: string
  email: string
  role?: string
  status?: string
  tenant_id: string
  last_login_at?: string | null
}
