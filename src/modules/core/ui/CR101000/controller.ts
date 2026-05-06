import { ref, watch, type Ref } from 'vue'
import { useScreenController, type ScreenController } from '@/platform/screen-runtime'
import { LIST_SCREEN_POLICY } from '@/platform/screen-runtime/common-policies'
import { CR101000 } from './screen'
import { roleCommands } from './commands'
import { useRoles } from '../../application/useRoles'
import type { Role } from '../../domain/user.types'

export interface RolesController extends ScreenController<{ roles: Role[] }, 'VIEW'> {
  isCreateOpen: Ref<boolean>
  isDetailOpen: Ref<boolean>
  selectedRole: Ref<Role | null>
  createName: Ref<string>
  createDescription: Ref<string>
  createPermissions: Ref<string[]>
  permissions: Ref<unknown[] | undefined>
  togglePermission: (code: string) => void
  handleRowClick: (role: Role) => void
}

export function useRolesController(): RolesController {
  const { roles, isRolesPending, createRole, isCreating, permissions } = useRoles()

  const controller = useScreenController<{ roles: Role[] }, 'VIEW'>({
    screen: CR101000,
    dataSource: {
      entity: ref({ roles: roles.value || [] }), // Wrap array
      isLoading: isRolesPending,
      error: ref(null),
    },
    getDomainState: () => 'VIEW',
    statePolicy: LIST_SCREEN_POLICY,
  })

  // Watch for roles updates
  watch(roles, (newRoles) => {
    controller.entity.value = { roles: newRoles || [] }
  })

  // Dialog state (Smart Panel equivalents)
  const isCreateOpen = ref(false)
  const isDetailOpen = ref(false)
  const selectedRole = ref<Role | null>(null)

  // Create Dialog Fields
  const createName = ref('')
  const createDescription = ref('')
  const createPermissions = ref<string[]>([])

  function togglePermission(code: string) {
    const index = createPermissions.value.indexOf(code)
    if (index > -1) {
      createPermissions.value.splice(index, 1)
    } else {
      createPermissions.value.push(code)
    }
  }

  // Register commands
  roleCommands.forEach((cmd) => {
    if (cmd.key === 'create') {
      controller.registerCommand(cmd.key, {
        isPending: ref(false),
        execute: async () => {
          createName.value = ''
          createDescription.value = ''
          createPermissions.value = []
          isCreateOpen.value = true
        },
      })
    } else if (cmd.key === 'executeCreate') {
      controller.registerCommand(cmd.key, {
        isPending: isCreating,
        execute: async () => {
          if (!createName.value) return
          await createRole({
            name: createName.value,
            description: createDescription.value,
            permissions: createPermissions.value,
          })
          isCreateOpen.value = false
        },
      })
    }
  })

  // Grid actions
  function handleRowClick(role: Role) {
    selectedRole.value = role
    isDetailOpen.value = true
  }

  return {
    ...controller,
    isCreateOpen,
    isDetailOpen,
    selectedRole,
    createName,
    createDescription,
    createPermissions,
    permissions, // System permissions for the checklist
    togglePermission,
    handleRowClick,
  }
}
