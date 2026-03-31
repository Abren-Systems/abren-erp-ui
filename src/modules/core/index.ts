import type { PlatformEngine } from '@/shared/types/module.types'
import routes from './routes'

export const coreModule: PlatformEngine = {
  id: 'core',
  name: 'Core',
  category: 'platform',
  routes,
  permissions: ['core.view', 'core.edit'],
  menuItems: [
    { label: 'Users', route: 'CoreUsers', icon: 'users' },
    { label: 'Roles', route: 'CoreRoles', icon: 'shield' },
    { label: 'Tenants', route: 'CoreTenants', icon: 'building' },
  ],
}
