import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { Money } from '@/shared/domain/money'
import { useApiQuery } from '@/shared/composables/useApiQuery'
import { CURRENCY_OPTIONS } from '../AP301500/fields'
import { useRouter } from 'vue-router'
import { useScreenController } from '@/platform/screen-runtime'
import { useWorkflowAction } from '@/platform/workflow-runtime/hooks/useWorkflowAction'
import { useVendorBill } from '../../application/useVendorBill'
import {
  useCreateVendorBill,
  type VendorBillFormLineValues,
} from '../../application/useCreateVendorBill'
import { apAdapter } from '../../infrastructure/ap.adapter'
import { useFormPersistence } from '@/shared/composables/useFormPersistence'
import { toId } from '@/shared/types/brand.types'
import type { VendorBillId } from '@/shared/types/brand.types'
import type { VendorDTO } from '../../infrastructure/api.types'
import { AP301000 } from './screen'
import { AP301000_FIELDS } from './fields'
import { useField } from '@/platform/field-system/bindings'
import type { VendorBill } from '../../models/ap.types'
import { AP301000_POLICY } from './policy'

/**
 * Platform-reserved command keys that must not be overwritten by dynamic
 * workflow action registration. The FormToolbar hardcodes 'save' and
 * 'cancel' as the standard buttons; colliding with them would replace
 * navigation behaviour with a workflow transition.
 */
const PLATFORM_RESERVED_KEYS = new Set(['save', 'cancel'])

export function useVendorBillController(id: string) {
  const router = useRouter()
  const isNew = computed(() => id === 'new')
  const billId = toId<VendorBillId>(id)

  // ── Data Fetching ──────────────────────────────────────────
  const { vendorBill, operations, isLoading } = useVendorBill(billId)

  // ── Workflow Actions (Unified Runtime) ─────────────────────
  const { dispatch, isLoading: isExecutingAction } = useWorkflowAction<VendorBill>({
    id,
    version: computed(() => operations.value?.version ?? 0),
    execute: (id, action, version, payload) =>
      apAdapter.executeBillAction(id, action, version, payload),
    queryKey: ['ap', 'vendor-bills', 'detail', id],
  })

  // ── Creation Form ──────────────────────────────────────────
  const { form, isSubmitting: isCreating } = useCreateVendorBill()
  useFormPersistence(form, 'abren_draft_vendor_bill')

  // ── Unified Entity (Graph) ─────────────────────────────────
  // The controller hides the difference between a draft form and
  // a persisted record, mirroring Acumatica's PXGraph pattern.
  const activeEntity = computed(() => {
    if (isNew.value) {
      const values = form.state.values
      return {
        ...values,
        id: 'new',
        status: 'DRAFT',
        totalAmount: Money.from(values.totalAmount || 0, 'ETB'),
        whtTotal: Money.from(0, 'ETB'),
        netPayable: Money.from(values.totalAmount || 0, 'ETB'),
        totalPaid: Money.from(0, 'ETB'),
        totalWithheld: Money.from(0, 'ETB'),
        lines: (values.lines || []).map((l: VendorBillFormLineValues) => ({
          ...l,
          amount: Money.from(l.amount || 0, 'ETB'),
        })),
      } as unknown as VendorBill
    }
    return vendorBill.value as VendorBill
  })

  // ── Platform Base ──────────────────────────────────────────
  const base = useScreenController<VendorBill, string>({
    screen: AP301000,
    dataSource: { entity: activeEntity, isLoading, error: ref(null) },
    isNew,
    getDomainState: (entity) => entity?.status ?? 'DRAFT',
    operations,
    statePolicy: AP301000_POLICY,
  })

  // Attach form to base so useField can find it for new records
  Object.assign(base, { form })

  // ── Line Data ──────────────────────────────────────────────
  const currentLines = computed(() => {
    if (isNew.value) {
      return (form.state.values.lines || []).map((l: VendorBillFormLineValues) => ({
        ...l,
        amount: Money.from(l.amount || 0, 'ETB'),
      }))
    }
    return vendorBill.value?.lines || []
  })
  const activeTab = ref('Expense Lines')

  // ── Line Handlers ──────────────────────────────────────────
  const addLine = () => {
    form.pushFieldValue('lines', {
      description: '',
      amount: 0,
      lineType: 'GOODS',
      accountId: '',
      categoryId: '',
    })
  }

  const removeLine = (index: number) => {
    void form.removeFieldValue('lines', index)
  }

  // ── Dynamic Command Registration ──────────────────────────
  // Use watch (not watchEffect) to avoid re-registration on every
  // reactive dependency change. Filter out platform-reserved keys
  // to prevent collisions with the Save/Cancel standard buttons.
  watch(
    () => operations.value?.actions,
    (actions) => {
      if (!actions) return
      for (const action of actions) {
        if (PLATFORM_RESERVED_KEYS.has(action.action)) continue
        base.registerCommand(action.action, {
          execute: async (payload) => dispatch(action, payload as Record<string, unknown>),
          isPending: isExecutingAction,
        })
      }
    },
    { immediate: true },
  )

  // ── Save Command (Acumatica-style) ────────────────────────
  // Behavioral contract:
  //  - Disabled when the form is pristine (no changes to save)
  //  - Shows a loading spinner during submission
  //  - Provides explicit validation feedback on failure
  //  - Prevents duplicate submissions via local lock
  //  - Transitions UI state: EDIT → SAVING → (redirect or EDIT)
  const isSaving = ref(false)

  base.registerCommand('save', {
    execute: async () => {
      // Guard: no-op when already saving or nothing changed
      if (isSaving.value || !form.state.isDirty) return

      // Guard: validate before committing to the save toast
      if (!form.state.canSubmit) {
        toast.error('Validation Failed', {
          description: 'Please correct the highlighted fields before saving.',
        })
        return
      }

      const toastId = toast.loading('Saving Vendor Bill…')
      isSaving.value = true
      base.state.transitionUI('SAVING')

      try {
        await form.handleSubmit()
        toast.dismiss(toastId)
        // Success toast + navigation is handled by useCreateVendorBill's onSuccess
      } catch {
        toast.dismiss(toastId)
        // Error toast is handled by useCreateVendorBill's onError
        base.state.transitionUI(isNew.value ? 'NEW' : 'EDIT')
      } finally {
        isSaving.value = false
      }
    },
    isPending: computed(() => isCreating.value || isSaving.value),
    canExecute: computed(() => !isCreating.value && !isSaving.value && form.state.isDirty),
  })

  // ── Cancel Command (Platform Navigation) ──────────────────
  // This is the standard toolbar "Cancel" button — navigates back
  // to the list screen, optionally confirming unsaved changes.
  // Workflow "cancel_bill" is a separate command registered via
  // dynamic command registration above.
  base.registerCommand('cancel', {
    execute: async () => {
      if (form.state.isDirty) {
        if (!confirm('You have unsaved changes. Are you sure you want to cancel?')) {
          return
        }
      }
      void router.push({ name: 'VendorBillList' })
    },
    isPending: computed(() => false),
  })

  // ── Create Payment Request (Navigation) ───────────────────
  base.registerCommand('create_pr', {
    execute: async () => void router.push({ name: 'PaymentRequestList' }),
    isPending: computed(() => false),
  })

  // ── Lookups ────────────────────────────────────────────────
  const { data: vendors } = useApiQuery(['ap', 'vendors'], () => apAdapter.listVendors())

  // ── Field Bindings ─────────────────────────────────────────
  const fields = {
    vendorId: useField(base, AP301000_FIELDS.vendorId, {
      options: computed(
        () => vendors.value?.map((v: VendorDTO) => ({ label: v.name, value: v.id })) || [],
      ),
    }),
    billNumber: useField(base, AP301000_FIELDS.billNumber),
    vendorInvoiceNumber: useField(base, AP301000_FIELDS.vendorInvoiceNumber),
    issueDate: useField(base, AP301000_FIELDS.issueDate),
    dueDate: useField(base, AP301000_FIELDS.dueDate),
    currency: useField(base, AP301000_FIELDS.currency, { options: CURRENCY_OPTIONS }),
    justification: useField(base, AP301000_FIELDS.justification),
    status: useField(base, AP301000_FIELDS.status),
    totalAmount: useField(base, AP301000_FIELDS.totalAmount),
    whtTotal: useField(base, AP301000_FIELDS.whtTotal),
    netPayable: useField(base, AP301000_FIELDS.netPayable),
    totalPaid: useField(base, AP301000_FIELDS.totalPaid),
    totalWithheld: useField(base, AP301000_FIELDS.totalWithheld),
  }

  return {
    ...base,
    fields,
    currentLines,
    activeTab,
    addLine,
    removeLine,
    form,
    isCreating,
    router,
    isLoading,
  }
}
