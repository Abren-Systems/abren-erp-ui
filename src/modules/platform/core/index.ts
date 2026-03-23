import type { PlatformEngine } from '@/core/types/module.types'

export const coreModule: PlatformEngine = {
  id: 'core',
  name: 'Core',
  category: 'platform',
  routes: () => import('./routes').then((m) => m.default),
  permissions: ['core.view', 'core.edit'],
  menuItems: [
    { label: 'Users', route: 'CoreUsers', icon: 'users' },
    { label: 'Roles', route: 'CoreRoles', icon: 'shield' },
    { label: 'Tenants', route: 'CoreTenants', icon: 'building' },
  ],
}
