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
import { CURRENCY_OPTIONS, AP301500_FIELDS } from './fields'
import { AP301500 } from './screen'
import { AP301500_POLICY } from './policy'
import { useField } from '@/platform/field-system/bindings'
import type { PaymentRequest, PaymentRequestStatus } from '../../models/ap.types'

/**
 * AP301500 — Payment Request Data Entry Controller
 *
 * Extends useScreenController with domain-specific behavior:
 * - Draft creation via TanStack Form
 * - Workflow action dispatch (approve, reject, submit, authorize, cancel)
 * - Navigation guards for unsaved changes
 * - Resolved display names for users
 *
 * This is the single source of behavior for AP301500/view.vue.
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
  const { request, operations, isLoading, error } = usePaymentRequest(id as PaymentRequestId)
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
    screen: AP301500,
    dataSource: { entity: activeEntity, isLoading, error },
    isNew,
    getDomainState: (entity) => entity.status,
    operations,
    statePolicy: AP301500_POLICY,
  })

  // Attach form to base so useField can find it for new records
  Object.assign(base, { form })

  // ── Workflow Action Executors ──
  // ── UI State ──
  const activeTab = ref('Line Details')
  const isTraceOpen = ref(false)
  const isRejectDialogOpen = ref(false)
  const isCancelDialogOpen = ref(false)
  const auditReason = ref('')
  const entityVersion = computed(() => operations.value?.version ?? 1)

  // ── Workflow Action Executors ──
  const { approve, isPending: isApproving } = useApprovePaymentRequest(
    id as PaymentRequestId,
    entityVersion,
  )
  const { reject, isPending: isRejecting } = useRejectPaymentRequest(
    id as PaymentRequestId,
    entityVersion,
  )
  const { authorize, isPending: isAuthorizing } = useAuthorizePaymentRequest(
    id as PaymentRequestId,
    entityVersion,
  )
  const { cancel, isPending: isCancelling } = useCancelPaymentRequest(
    id as PaymentRequestId,
    entityVersion,
  )
  const { submit, isPending: isSubmittingRequest } = useSubmitPaymentRequest(
    id as PaymentRequestId,
    entityVersion,
  )

  // Register command executors — the FormToolbar reads these for dispatch
  base.registerCommand('submit', {
    execute: async () => {
      await submit()
    },
    isPending: isSubmittingRequest,
  })
  base.registerCommand('approve', {
    execute: async () => {
      await approve()
    },
    isPending: isApproving,
  })
  base.registerCommand('reject', {
    execute: async () => {
      auditReason.value = ''
      isRejectDialogOpen.value = true
    },
    isPending: isRejecting,
  })
  base.registerCommand('authorize', {
    execute: async () => {
      await authorize()
    },
    isPending: isAuthorizing,
  })
  base.registerCommand('cancel', {
    execute: async () => {
      auditReason.value = ''
      isCancelDialogOpen.value = true
    },
    isPending: isCancelling,
  })

  const handleRejectConfirm = async () => {
    if (!auditReason.value.trim()) return
    try {
      await reject(auditReason.value)
      isRejectDialogOpen.value = false
    } catch (error) {
      base.handleCommandError(error)
      throw error
    }
  }

  const handleCancelConfirm = async () => {
    if (!auditReason.value.trim()) return
    try {
      await cancel(auditReason.value)
      isCancelDialogOpen.value = false
    } catch (error) {
      base.handleCommandError(error)
      throw error
    }
  }

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
    requesterId: useField(base, AP301500_FIELDS.requesterId),
    beneficiaryId: useField(base, AP301500_FIELDS.beneficiaryId),
    status: useField(base, AP301500_FIELDS.status),
    submittedAt: useField(base, AP301500_FIELDS.submittedAt),
    justification: useField(base, AP301500_FIELDS.justification),
    currency: useField(base, AP301500_FIELDS.currency),
    totalAmount: useField(base, AP301500_FIELDS.totalAmount),
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
    isRejectDialogOpen,
    isCancelDialogOpen,
    auditReason,

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
    handleRejectConfirm,
    handleCancelConfirm,

    // Navigation
    router,
  }
}
