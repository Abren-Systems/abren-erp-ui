import { useDataGrid } from '@/shared/components/data-grid'
import { computed, ref, reactive } from 'vue'
import {
  useScreenController,
  LIST_SCREEN_POLICY,
  listScreenDomainState,
} from '@/platform/screen-runtime'
import { SM201010 } from './screen'
import { useUsers } from '../../application/useUsers'
import { useRoles } from '../../application/useRoles'
import type { User } from '../../models/user.types'

export function useUsersController() {
  const gridState = useDataGrid()
  const { users, isPending, error, createUser, assignRole, isCreating, isAssigning } = useUsers()
  const { roles, isRolesPending } = useRoles()

  const base = useScreenController<{ users: User[] }, 'VIEW'>({
    screen: SM201010,
    dataSource: {
      entity: computed(() => ({ users: users.value || [] })),
      isLoading: isPending,
      error,
    },
    isNew: computed(() => false),
    getDomainState: listScreenDomainState,
    statePolicy: LIST_SCREEN_POLICY,
  })

  // Dialog state
  const isInviteOpen = ref(false)
  const isAssignmentOpen = ref(false)
  const selectedUser = ref<User | null>(null)
  const inviteErrorMessage = ref<string | null>(null)

  // Field values
  const inviteEmail = ref('')
  const invitePassword = ref('')
  const assignRoleId = ref('')

  // Register Commands
  base.registerCommand('invite', {
    execute: async () => {
      inviteEmail.value = ''
      invitePassword.value = ''
      inviteErrorMessage.value = null
      isInviteOpen.value = true
    },
    canExecute: computed(() => true),
    isPending: computed(() => false),
  })

  base.registerCommand('executeInvite', {
    execute: async () => {
      inviteErrorMessage.value = null
      if (!inviteEmail.value || !invitePassword.value) return
      try {
        await createUser({ email: inviteEmail.value, password: invitePassword.value })
        isInviteOpen.value = false
      } catch (err) {
        inviteErrorMessage.value = err instanceof Error ? err.message : 'Failed to create user.'
      }
    },
    canExecute: computed(() => !!inviteEmail.value && !!invitePassword.value),
    isPending: isCreating,
  })

  base.registerCommand('executeAssign', {
    execute: async () => {
      if (!selectedUser.value || !assignRoleId.value) return
      await assignRole({ userId: selectedUser.value.id, roleId: assignRoleId.value })
      isAssignmentOpen.value = false
    },
    canExecute: computed(() => !!selectedUser.value && !!assignRoleId.value),
    isPending: isAssigning,
  })

  const handleRowClick = (row: unknown) => {
    selectedUser.value = row as User
    assignRoleId.value = ''
    isAssignmentOpen.value = true
  }

  const roleOptions = computed(
    () =>
      roles.value?.map((r) => ({
        label: r.name,
        value: r.id,
      })) || [],
  )

  return {
    ...base,
    users,
    isInviteOpen,
    isAssignmentOpen,
    selectedUser,
    inviteEmail,
    invitePassword,
    inviteErrorMessage,
    assignRoleId,
    roleOptions,
    isRolesPending,
    handleRowClick,
    gridState: reactive(gridState),
  }
}
