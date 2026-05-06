import { ref, watch, type Ref } from 'vue'
import { useScreenController, type ScreenController } from '@/platform/screen-runtime'
import { LIST_SCREEN_POLICY } from '@/platform/screen-runtime/common-policies'
import { CR201000 } from './screen'
import { userCommands } from './commands'
import { useUsers } from '../../application/useUsers'
import { useRoles } from '../../application/useRoles'
import type { User } from '../../domain/user.types'
import type { Role } from '../../domain/user.types'

export interface UsersController extends ScreenController<{ users: User[] }, 'VIEW'> {
  isInviteOpen: Ref<boolean>
  isAssignmentOpen: Ref<boolean>
  selectedUser: Ref<User | null>
  inviteEmail: Ref<string>
  invitePassword: Ref<string>
  inviteErrorMessage: Ref<string | null>
  assignRoleId: Ref<string>
  roles: Ref<Role[] | undefined>
  isRolesPending: Ref<boolean>
  handleRowClick: (user: User) => void
}

export function useUsersController(): UsersController {
  const { users, isPending, createUser, assignRole, isCreating, isAssigning } = useUsers()
  const { roles, isRolesPending } = useRoles()

  const controller = useScreenController<{ users: User[] }, 'VIEW'>({
    screen: CR201000,
    dataSource: {
      entity: ref({ users: users.value || [] }), // Wrap array
      isLoading: isPending,
      error: ref(null),
    },
    getDomainState: () => 'VIEW',
    statePolicy: LIST_SCREEN_POLICY,
  })

  // Watch for users updates
  watch(users, (newUsers) => {
    controller.entity.value = { users: newUsers || [] }
  })

  // Dialog state (Smart Panel equivalents)
  const isInviteOpen = ref(false)
  const isAssignmentOpen = ref(false)
  const selectedUser = ref<User | null>(null)
  const inviteErrorMessage = ref<string | null>(null)

  // Field values for dialogs
  const inviteEmail = ref('')
  const invitePassword = ref('')
  const assignRoleId = ref('')

  // Bind values to fields (simulate 2-way binding for dumb components)
  // In a full implementation, `useField` returns a modelValue binding.
  // We'll manage it here for simplicity.

  // Register commands
  userCommands.forEach((cmd) => {
    if (cmd.key === 'invite') {
      controller.registerCommand(cmd.key, {
        isPending: ref(false),
        execute: async () => {
          inviteEmail.value = ''
          invitePassword.value = ''
          inviteErrorMessage.value = null
          isInviteOpen.value = true
        },
      })
    } else if (cmd.key === 'executeInvite') {
      controller.registerCommand(cmd.key, {
        isPending: isCreating,
        execute: async () => {
          inviteErrorMessage.value = null
          if (!inviteEmail.value || !invitePassword.value) return
          if (invitePassword.value.length < 8) {
            inviteErrorMessage.value = 'Password must be at least 8 characters.'
            return
          }
          try {
            await createUser({ email: inviteEmail.value, password: invitePassword.value })
            isInviteOpen.value = false
          } catch (err) {
            inviteErrorMessage.value = err instanceof Error ? err.message : 'Failed to create user.'
          }
        },
      })
    } else if (cmd.key === 'executeAssign') {
      controller.registerCommand(cmd.key, {
        isPending: isAssigning,
        execute: async () => {
          if (!selectedUser.value || !assignRoleId.value) return
          await assignRole({ user_id: selectedUser.value.id, role_id: assignRoleId.value })
          isAssignmentOpen.value = false
        },
      })
    }
  })

  // Grid actions
  function handleRowClick(user: User) {
    selectedUser.value = user
    assignRoleId.value = ''
    isAssignmentOpen.value = true
  }

  return {
    ...controller,
    isInviteOpen,
    isAssignmentOpen,
    selectedUser,
    inviteEmail,
    invitePassword,
    inviteErrorMessage,
    assignRoleId,
    roles,
    isRolesPending,
    handleRowClick,
  }
}
