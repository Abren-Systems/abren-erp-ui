import { computed, ref } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useScreenController } from '@/platform/screen-runtime'
import type { PaymentRequestId } from '@/shared/types/brand.types'
import { usePaymentRequest } from '../../application/usePaymentRequest'
import { useCreatePaymentRequest } from '../../application/useCreatePaymentRequest'
import { useApprovePaymentRequest } from '../../application/useApprovePaymentRequest'
import { useRejectPaymentRequest } from '../../application/useRejectPaymentRequest'
import { useAuthorizePaymentRequest } from '../../application/useAuthorizePaymentRequest'
import { useCancelPaymentRequest } from '../../application/useCancelPaymentRequest'
import { useSubmitPaymentRequest } from '../../application/useSubmitPaymentRequest'
import { useUsers } from '@/modules/core/application/useUsers'
import { CURRENCY_OPTIONS, AP301000_FIELDS } from './fields'
import { AP301000 } from './screen'
import { AP301000_POLICY } from './policy'
import { useField } from '@/platform/field-system/bindings'
import type { PaymentRequest, PaymentRequestStatus } from '../../domain/ap.types'

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
 *
 * Commands are declared in commands.ts (data objects).
 * Execution handlers are registered here via registerCommand().
 * The FormToolbar reads both to render and dispatch actions.
 */
export function usePaymentRequestEntry(id: string) {
  const router = useRouter()
  const isNew = computed(() => id === 'new')

  // ── Data Sources ──
  const { request, isLoading, error } = usePaymentRequest(id as PaymentRequestId)
  const { users } = useUsers()

  // ── Creation Form ──
  const { form, isSubmitting: isCreating, isSaved, saveDraft } = useCreatePaymentRequest()

  // ── Graph Unified Entity ──
  // The Controller acts as the PXGraph, hiding the difference between a draft and a saved record.
  const activeEntity = computed<PaymentRequest | null | undefined>(() => {
    if (isNew.value) {
      // Cast form state to match the read model shape approximately
      return {
        ...(form.state.values as unknown as PaymentRequest),
        status: 'DRAFT' as PaymentRequestStatus,
      }
    }
    return request.value
  })

  // ── Platform Base ──
  const base = useScreenController<PaymentRequest, PaymentRequestStatus>({
    screen: AP301000,
    dataSource: { entity: activeEntity, isLoading, error },
    isNew,
    getDomainState: (entity) => entity.status,
    statePolicy: AP301000_POLICY,
  })

  // ── Workflow Action Executors ──
  const { approve, isPending: isApproving } = useApprovePaymentRequest(id as PaymentRequestId)
  const { reject, isPending: isRejecting } = useRejectPaymentRequest(id as PaymentRequestId)
  const { authorize, isPending: isAuthorizing } = useAuthorizePaymentRequest(id as PaymentRequestId)
  const { cancel, isPending: isCancelling } = useCancelPaymentRequest(id as PaymentRequestId)
  const { submit, isPending: isSubmittingRequest } = useSubmitPaymentRequest(id as PaymentRequestId)

  // Register command executors — the FormToolbar reads these for dispatch
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
  const isDraft = computed(() => isNew.value || activeEntity.value?.status === 'DRAFT')

  // ── Resolved Display Names ──
  const requesterEmail = computed(() => {
    if (isNew.value) return 'Current User'
    const user = users.value?.find((u) => u.id === activeEntity.value?.requesterId)
    return user?.email ?? activeEntity.value?.requesterId
  })

  const beneficiaryEmail = computed(() => {
    const targetId = activeEntity.value?.beneficiaryId
    if (!targetId) return ''
    const user = users.value?.find((u) => u.id === targetId)
    return user?.email ?? targetId
  })

  // ── Grid Data ──
  const currentLines = computed(() => {
    return activeEntity.value?.lines || []
  })

  const userOptions = computed(
    () => users.value?.map((u) => ({ label: u.email, value: u.id })) || [],
  )
  const currencyOptions = computed(() => CURRENCY_OPTIONS)

  // ── Action Dispatch (for creation-mode Save/Create) ──
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

  // ── Field Bindings ──────────────────────────────────────
  // This is where behavioral discipline is enforced.
  const fields = {
    requesterId: useField(base, AP301000_FIELDS.requesterId),
    beneficiaryId: useField(base, AP301000_FIELDS.beneficiaryId),
    status: useField(base, AP301000_FIELDS.status),
    submittedAt: useField(base, AP301000_FIELDS.submittedAt),
    justification: useField(base, AP301000_FIELDS.justification),
    currency: useField(base, AP301000_FIELDS.currency),
    totalAmount: useField(base, AP301000_FIELDS.totalAmount),
  }

  return {
    // Platform base (data selectors, state machine, commands)
    ...base,

    // Field Bindings
    fields,

    // Creation form
    form,
    isCreating,
    saveDraft,

    // UI state
    activeTab,
    isTraceOpen,

    // Domain derived
    isDraft,

    // Resolved names
    requesterEmail,
    beneficiaryEmail,

    // Grid
    currentLines,

    // Options
    userOptions,
    currencyOptions,

    // Handlers
    handleCreate,

    // Navigation
    router,
  }
}
