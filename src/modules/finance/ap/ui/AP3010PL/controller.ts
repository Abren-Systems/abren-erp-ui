import { computed, ref, h } from 'vue'
import { useRouter } from 'vue-router'
import {
  useScreenController,
  LIST_SCREEN_POLICY,
  listScreenDomainState,
} from '@/platform/screen-runtime'
import { usePermissions } from '@/shared/auth/usePermissions'
import type { Table, Row } from '@tanstack/vue-table'
import { usePaymentRequests } from '../../application/usePaymentRequests'
import type { PaymentRequest } from '../../domain/ap.types'
import type { PaymentRequestId } from '@/shared/types/brand.types'
import { useUsers } from '@/modules/core/application/useUsers'
import type { User } from '@/modules/core/domain/user.types'
import { Money } from '@/shared/domain/money'
import { useDataGrid } from '@/shared/components/data-grid'
import { SelectionCell } from '@/shared/components/data-grid'
import { AppButton } from '@/shared/components/primitives'
import { CheckCircle, XCircle, Plus, History } from 'lucide-vue-next'
import { paymentRequestColumns } from './grids/primary.grid'
import { PAYMENT_REQUEST_STATUS_OPTIONS, PAYMENT_REQUEST_FILTER_PRESETS } from '../AP301000/fields'
import { AP3010PL } from './screen'

export function usePaymentRequestList() {
  const router = useRouter()
  const { hasPermission } = usePermissions()
  const { requests, isLoading, error, refetch } = usePaymentRequests()
  const { users } = useUsers()

  const base = useScreenController<PaymentRequest[], 'VIEW'>({
    screen: AP3010PL,
    dataSource: {
      entity: requests,
      isLoading,
      error,
    },
    isNew: computed(() => false),
    getDomainState: listScreenDomainState,
    statePolicy: LIST_SCREEN_POLICY,
  })

  // Register Commands
  base.registerCommand('create', {
    execute: async () => {
      void router.push({ name: 'PaymentRequestDetail', params: { id: 'new' } })
    },
    isPending: computed(() => false),
  })

  base.registerCommand('refresh', {
    execute: async () => {
      await refetch()
    },
    isPending: isLoading,
  })

  // ── Data Grid State ──
  const gridState = useDataGrid()

  // ── Filter State ──
  const statusFilter = ref('all')
  const isFilterOpen = ref(false)
  const filterState = ref({
    statuses: [] as string[],
    dateFrom: '',
    dateTo: '',
  })
  const filterPresets = PAYMENT_REQUEST_FILTER_PRESETS
  const statusOptions = PAYMENT_REQUEST_STATUS_OPTIONS

  // ── Trace State ──
  const isTraceOpen = ref(false)
  const traceTarget = ref<PaymentRequest | null>(null)

  // ── Derived State ──
  const selectedCount = computed(() => Object.keys(gridState.rowSelection.value).length)

  const filteredRequests = computed(() => {
    if (!requests.value) return []
    let data = requests.value

    if (statusFilter.value === 'needs_attention') {
      data = data.filter((r) => ['DRAFT', 'REJECTED'].includes(r.status))
    } else if (statusFilter.value === 'in_review') {
      data = data.filter((r) => ['SUBMITTED', 'APPROVED', 'AUTHORIZED'].includes(r.status))
    }

    if (filterState.value.statuses.length > 0) {
      data = data.filter((r) => filterState.value.statuses.includes(r.status))
    }

    return data.map((r) => {
      const requester = users.value?.find((u) => u.id === r.requesterId)
      const beneficiary = users.value?.find((u) => u.id === r.beneficiaryId)

      const formatName = (user?: User, id?: string) => {
        if (!user) return id?.slice(0, 8) || 'Unknown'
        return user.email || id?.slice(0, 8)
      }

      const getActionRequired = (status: string) => {
        switch (status) {
          case 'REJECTED':
            return { label: 'Edit & Resubmit', icon: XCircle, color: 'text-danger-600' }
          case 'DRAFT':
            return { label: 'Submit for Approval', icon: Plus, color: 'text-neutral-600' }
          case 'SUBMITTED':
            return { label: 'Review & Approve', icon: CheckCircle, color: 'text-warning-600' }
          case 'APPROVED':
            return { label: 'Authorize Payment', icon: CheckCircle, color: 'text-info-600' }
          default:
            return null
        }
      }

      return {
        ...r,
        requesterName: formatName(requester, r.requesterId),
        beneficiaryName: formatName(beneficiary, r.beneficiaryId),
        actionRequired: getActionRequired(r.status),
      }
    })
  })

  const totalFilteredAmount = computed(() => {
    return filteredRequests.value.reduce((acc, r) => acc.add(r.totalAmount), Money.zero())
  })

  const selectedIds = computed(() => {
    return Object.keys(gridState.rowSelection.value) as PaymentRequestId[]
  })

  // ── Grid Columns ──
  const columns = [
    {
      id: 'select',
      header: ({ table }: { table: Table<PaymentRequest> }) =>
        h(SelectionCell, {
          checked: table.getIsAllPageRowsSelected(),
          indeterminate: table.getIsSomePageRowsSelected(),
          'onUpdate:checked': (value: boolean) => table.toggleAllPageRowsSelected(!!value),
        }),
      cell: ({ row }: { row: Row<PaymentRequest> }) =>
        h(SelectionCell, {
          checked: row.getIsSelected(),
          'onUpdate:checked': (value: boolean) => row.toggleSelected(!!value),
        }),
      size: 40,
    },
    ...paymentRequestColumns,
    {
      id: 'action_required',
      header: 'ACTION REQUIRED?',
      cell: ({ row }: { row: Row<PaymentRequest> }) => {
        const action = (
          row.original as PaymentRequest & {
            actionRequired?: { label: string; icon: typeof CheckCircle; color: string }
          }
        ).actionRequired
        if (!action) return null
        return h('div', { class: ['flex items-center gap-1.5 font-medium', action.color] }, [
          h(action.icon, { size: 14 }),
          h('span', { class: 'text-[11px]' }, action.label),
        ])
      },
      size: 160,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }: { row: Row<PaymentRequest> }) =>
        h(
          'div',
          { class: 'flex justify-end pr-2' },
          h(
            AppButton,
            {
              variant: 'stealth',
              size: 'sm',
              class: [
                'trace-action-btn',
                traceTarget.value?.id === row.original.id && isTraceOpen.value ? 'is-active' : '',
              ],
              onClick: (e: Event) => {
                e.stopPropagation()
                handleTrace(row.original)
              },
            },
            () => h(History, { size: 14 }),
          ),
        ),
      size: 60,
    },
  ]

  // ── Handlers ──
  function handleTrace(pr: PaymentRequest) {
    if (traceTarget.value?.id === pr.id && isTraceOpen.value) {
      isTraceOpen.value = false
      return
    }
    traceTarget.value = pr
    isTraceOpen.value = true
  }

  const handleRowClick = (row: unknown) => {
    void router.push({
      name: 'PaymentRequestDetail',
      params: { id: (row as PaymentRequest).id },
    })
  }

  function clearFilters() {
    statusFilter.value = 'all'
    filterState.value = { statuses: [], dateFrom: '', dateTo: '' }
    gridState.globalFilter.value = ''
  }

  function clearSelection() {
    gridState.rowSelection.value = {}
  }

  return {
    ...base,
    hasPermission,
    gridState,
    statusFilter,
    isFilterOpen,
    filterState,
    filterPresets,
    statusOptions,
    isTraceOpen,
    traceTarget,
    selectedCount,
    filteredRequests,
    totalFilteredAmount,
    selectedIds,
    columns,
    handleTrace,
    handleRowClick,
    clearFilters,
    clearSelection,
  }
}
