import type { PlatformEngine } from '@/shared/types/module.types'
import routes from './routes'
import { systemScreens } from './screens'

export const systemModule: PlatformEngine = {
  id: 'system',
  name: 'System',
  category: 'platform',
  routes,
  screens: systemScreens,
  permissions: ['workflows:view', 'workflows:approve'],
  icon: 'shield',
}
