import { computed, ref } from 'vue'
import {
  useScreenController,
  LIST_SCREEN_POLICY,
  listScreenDomainState,
} from '@/platform/screen-runtime'
import { CR101000 } from './screen'
import { useRoles } from '../../application/useRoles'
import type { Role } from '../../domain/user.types'

export function useRolesController() {
  const { roles, isRolesPending, rolesError, createRole, isCreating, permissions } = useRoles()

  const base = useScreenController<{ roles: Role[] }, 'VIEW'>({
    screen: CR101000,
    dataSource: {
      entity: computed(() => ({ roles: roles.value || [] })),
      isLoading: isRolesPending,
      error: rolesError,
    },
    isNew: computed(() => false),
    getDomainState: listScreenDomainState,
    statePolicy: LIST_SCREEN_POLICY,
  })

  // Dialog state
  const isCreateOpen = ref(false)
  const isDetailOpen = ref(false)
  const selectedRole = ref<Role | null>(null)

  // Fields
  const createName = ref('')
  const createDescription = ref('')
  const createPermissions = ref<string[]>([])

  // Register Commands
  base.registerCommand('create', {
    execute: async () => {
      createName.value = ''
      createDescription.value = ''
      createPermissions.value = []
      isCreateOpen.value = true
    },
    isPending: computed(() => false),
  })

  base.registerCommand('executeCreate', {
    execute: async () => {
      if (!createName.value) return
      await createRole({
        name: createName.value,
        description: createDescription.value,
        permissions: createPermissions.value,
      })
      isCreateOpen.value = false
    },
    isPending: isCreating,
  })

  function togglePermission(code: string) {
    const index = createPermissions.value.indexOf(code)
    if (index > -1) {
      createPermissions.value.splice(index, 1)
    } else {
      createPermissions.value.push(code)
    }
  }

  const handleRowClick = (row: unknown) => {
    selectedRole.value = row as Role
    isDetailOpen.value = true
  }

  return {
    ...base,
    roles,
    isCreateOpen,
    isDetailOpen,
    selectedRole,
    createName,
    createDescription,
    createPermissions,
    permissions,
    togglePermission,
    handleRowClick,
  }
}
