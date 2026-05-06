import type { PlatformEngine } from '@/shared/types/module.types'
import routes from './routes'
import { coreScreens } from './screens'

export const coreModule: PlatformEngine = {
  id: 'core',
  name: 'Core',
  category: 'platform',
  screens: coreScreens,
  routes,
  permissions: ['core:view', 'core:user_edit', 'core:role_edit'],
  menuItems: [
    { label: 'Users', route: 'CoreUsers', icon: 'users' },
    { label: 'Roles', route: 'CoreRoles', icon: 'shield' },
    { label: 'Tenants', route: 'CoreTenants', icon: 'building' },
  ],
}
