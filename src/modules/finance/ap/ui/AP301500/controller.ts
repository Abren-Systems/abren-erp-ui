import { computed, reactive, ref } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useScreenController } from '@/platform/screen-runtime'
import type { PaymentRequestId } from '@/shared/types/brand.types'
import { usePaymentRequest } from '../../application/usePaymentRequest'
import { useCreatePaymentRequest } from '../../application/useCreatePaymentRequest'
import { useUsers } from '@/modules/core/application/useUsers'
import { CURRENCY_OPTIONS, AP301500_FIELDS } from './fields'
import { AP301500 } from './screen'
import { AP301500_POLICY } from './policy'
import { useField } from '@/platform/field-system/bindings'
import { useWorkflowAction } from '@/platform/workflow-runtime/hooks/useWorkflowAction'
import { apAdapter } from '../../infrastructure/ap.adapter'
import { watch } from 'vue'
import type { PaymentRequest } from '../../models/ap.types'

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
  const { paymentRequest, operations, isLoading, error } = usePaymentRequest(id as PaymentRequestId)
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
        status: 'DRAFT',
      }
    }
    return paymentRequest.value
  })

  // ── Platform Base ──
  const base = useScreenController<PaymentRequest, string>({
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

  // ── Workflow Action Runtime (Generic Dispatcher) ──
  const { dispatch, isLoading: isExecutingAction } = useWorkflowAction({
    id,
    version: entityVersion,
    execute: (id, action, version, payload) =>
      apAdapter.executeRequestAction(id as PaymentRequestId, action, version, payload),
    queryKey: ['payment-request', id],
  })

  // Register commands dynamically from backend projection
  watch(
    () => operations.value?.actions,
    (actions) => {
      if (!actions) return
      actions.forEach((action) => {
        base.registerCommand(action.action, {
          execute: async (payload) => dispatch(action, payload as Record<string, unknown>),
          isPending: isExecutingAction,
        })
      })
    },
    { immediate: true },
  )

  // Register static commands
  base.registerCommand('save', {
    execute: async () => {
      void form.handleSubmit()
    },
    isPending: isCreating,
  })

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
    requesterId: useField(base, AP301500_FIELDS.requesterId, { options: userOptions }),
    beneficiaryId: useField(base, AP301500_FIELDS.beneficiaryId, { options: userOptions }),
    status: useField(base, AP301500_FIELDS.status),
    submittedAt: useField(base, AP301500_FIELDS.submittedAt),
    justification: useField(base, AP301500_FIELDS.justification),
    currency: useField(base, AP301500_FIELDS.currency, { options: currencyOptions }),
    totalAmount: useField(base, AP301500_FIELDS.totalAmount),
  }

  return reactive({
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

    // Navigation
    router,
    isLoading,
  })
}
