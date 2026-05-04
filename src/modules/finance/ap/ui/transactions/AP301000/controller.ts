import { computed, ref } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useScreenController } from '@/platform/screen-runtime'
import type { PaymentRequestId } from '@/shared/types/brand.types'
import type { ActionContract } from '@/platform/component-contracts'
import { usePaymentRequest } from '../../../application/composables/usePaymentRequest'
import { useCreatePaymentRequest } from '../../../application/composables/useCreatePaymentRequest'
import { useApprovePaymentRequest } from '../../../application/composables/useApprovePaymentRequest'
import { useRejectPaymentRequest } from '../../../application/composables/useRejectPaymentRequest'
import { useAuthorizePaymentRequest } from '../../../application/composables/useAuthorizePaymentRequest'
import { useCancelPaymentRequest } from '../../../application/composables/useCancelPaymentRequest'
import { useSubmitPaymentRequest } from '../../../application/composables/useSubmitPaymentRequest'
import { useUsers } from '@/modules/core/application/composables/useUsers'
import { getPaymentRequestActions } from './commands'
import { CURRENCY_OPTIONS } from './fields'
import { AP301000 } from './screen'

/**
 * AP301000 — Payment Request Data Entry Controller
 *
 * Extends useScreenController with domain-specific behavior:
 * - Draft creation via TanStack Form
 * - Workflow action dispatch (approve, reject, submit, authorize, cancel)
 * - Navigation guards for unsaved changes
 * - Resolved display names for users
 *
 * This is the single source of behavior for AP301000/view.vue.
 * The view template reads from this controller exclusively.
 */
export function usePaymentRequestEntry(id: string) {
  const router = useRouter()
  const isNew = computed(() => id === 'new')

  // ── Data Sources ──
  const { request, isLoading, error } = usePaymentRequest(id as PaymentRequestId)
  const { users } = useUsers()

  // ── Platform Base ──
  const base = useScreenController({
    screen: AP301000,
    dataSource: { entity: request, isLoading, error },
    isNew,
  })

  // ── Creation Form ──
  const { form, isSubmitting: isCreating, isSaved, saveDraft } = useCreatePaymentRequest()

  // ── Workflow Actions ──
  const { approve, isPending: isApproving } = useApprovePaymentRequest(id as PaymentRequestId)
  const { reject, isPending: isRejecting } = useRejectPaymentRequest(id as PaymentRequestId)
  const { authorize, isPending: isAuthorizing } = useAuthorizePaymentRequest(id as PaymentRequestId)
  const { cancel, isPending: isCancelling } = useCancelPaymentRequest(id as PaymentRequestId)
  const { submit, isPending: isSubmittingRequest } = useSubmitPaymentRequest(id as PaymentRequestId)

  // Register commands on the base controller
  base.registerCommand('submit', {
    execute: async () => void submit(),
    isPending: isSubmittingRequest,
  })
  base.registerCommand('approve', { execute: async () => void approve(), isPending: isApproving })
  base.registerCommand('reject', {
    execute: async () => void reject('Rejected via Focus Screen'),
    isPending: isRejecting,
  })
  base.registerCommand('authorize', {
    execute: async () => void authorize(),
    isPending: isAuthorizing,
  })
  base.registerCommand('cancel', {
    execute: async () => void cancel('Cancelled via Focus Screen'),
    isPending: isCancelling,
  })

  // ── UI State ──
  const activeTab = ref('Line Details')
  const isTraceOpen = ref(false)

  // ── Domain Derived State ──
  const isDraft = computed(() => isNew.value || request.value?.status === 'DRAFT')
  const displayStatus = computed(() => (isNew.value ? 'DRAFT' : request.value?.status))
  const displaySubmittedAt = computed(() => (isNew.value ? null : request.value?.submittedAt))

  const actions = computed<ActionContract[]>(() => {
    if (isNew.value) return []
    if (!request.value) return []
    return getPaymentRequestActions(request.value.status)
  })

  // ── Resolved Display Names ──
  const requesterEmail = computed(() => {
    if (isNew.value) return 'Current User'
    const user = users.value?.find((u) => u.id === request.value?.requesterId)
    return user?.email ?? request.value?.requesterId
  })

  const beneficiaryEmail = computed(() => {
    const targetId = isNew.value ? form.state.values.beneficiaryId : request.value?.beneficiaryId
    if (!targetId) return ''
    const user = users.value?.find((u) => u.id === targetId)
    return user?.email ?? targetId
  })

  // ── Grid Data ──
  const currentLines = computed(() => {
    if (isNew.value) return form.state.values.lines || []
    return request.value?.lines || []
  })

  const userOptions = computed(
    () => users.value?.map((u) => ({ label: u.email, value: u.id })) || [],
  )
  const currencyOptions = computed(() => CURRENCY_OPTIONS)

  // ── Action Dispatch ──
  function handleAction(key: string) {
    const command = base.commands.value[key]
    if (command) void command.execute()
  }

  function handleCreate() {
    void form.handleSubmit()
  }

  // ── Navigation Guard ──
  onBeforeRouteLeave((_to, _from, next) => {
    if (isNew.value && !isSaved.value && !isCreating.value) {
      const answer = window.confirm(
        'You have unsaved work. Would you like to leave without saving?',
      )
      next(answer)
    } else {
      next()
    }
  })

  return {
    // Platform base (data selectors, state machine, commands)
    ...base,

    // Creation form
    form,
    isCreating,
    saveDraft,

    // UI state
    activeTab,
    isTraceOpen,

    // Domain derived
    isDraft,
    displayStatus,
    displaySubmittedAt,
    actions,

    // Resolved names
    requesterEmail,
    beneficiaryEmail,

    // Grid
    currentLines,

    // Options
    userOptions,
    currencyOptions,

    // Handlers
    handleAction,
    handleCreate,

    // Navigation
    router,
  }
}
