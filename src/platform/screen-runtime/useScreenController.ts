import { ref, computed, watch, onUnmounted, shallowRef, type ComputedRef, type Ref } from 'vue'
import type { ScreenDefinition } from './screen-definition.types'
import type { ScreenData, ControllerCommand, ScreenController } from './screen-controller.types'
import type { UIState, BaseDomainState, ScreenStateMachine } from './state-machine.types'
import type { BannerPolicy, ScreenStatePolicy } from './screen-state-policy.types'
import type { WorkflowOperations } from '../workflow-runtime/models/workflows.types'
import { resolveScreenProjection } from './resolve-screen-model'
import type { CommandProjection } from './screen-projection.types'
import { transitionRecorder } from '../debug/transition-recorder'
import { ConflictError } from '@/shared/api/http-client'

// ── Screen Controller Options ─────────────────────────────
// Passed by the screen-specific controller to configure data loading.

export interface ScreenControllerDataSource<T> {
  /** The reactive entity (from TanStack Query or form state) */
  readonly entity: Ref<T | null | undefined>
  /** Whether the data source is loading */
  readonly isLoading: Ref<boolean>
  /** Error from the data source, if any */
  readonly error: Ref<Error | null | undefined>
  /** Authoritative projection of current operational capabilities */
  readonly operations?: Ref<WorkflowOperations | undefined>
}

export interface ScreenControllerOptions<T, TDomain extends string = BaseDomainState> {
  /** The ScreenDefinition metadata */
  readonly screen: ScreenDefinition
  /** The primary data source — wired by the screen-specific controller */
  readonly dataSource: ScreenControllerDataSource<T>
  /** Whether this is a new record (creation mode) */
  readonly isNew?: Ref<boolean>
  /** Function to extract the module-specific DomainState from the entity */
  readonly getDomainState: (entity: T) => TDomain
  readonly operations?: Ref<WorkflowOperations | undefined>
  readonly statePolicy: ScreenStatePolicy<TDomain>
  /** Grid states to project into the model */
  readonly grids?: ComputedRef<Record<string, unknown>>
}

// ── Granular Data Access ──────────────────────────────────
// Implements the memoized selector pattern from ScreenData<T>.
// Subscribing to 'status' does NOT re-render when 'currency' changes.

function createScreenData<T>(entity: Ref<T | null | undefined>): ScreenData<T> {
  const selectorCache = new Map<keyof T, ComputedRef<unknown>>()

  return {
    select<K extends keyof T>(key: K): ComputedRef<T[K] | undefined> {
      if (!selectorCache.has(key)) {
        selectorCache.set(
          key,
          computed(() => entity.value?.[key]),
        )
      }
      return selectorCache.get(key) as ComputedRef<T[K] | undefined>
    },

    selectGrid<K extends keyof T>(gridKey: K): ComputedRef<unknown[]> {
      const cacheKey = `__grid_${String(gridKey)}` as keyof T
      if (!selectorCache.has(cacheKey)) {
        selectorCache.set(
          cacheKey,
          computed(() => {
            const value = entity.value?.[gridKey]
            return Array.isArray(value) ? value : []
          }),
        )
      }
      return selectorCache.get(cacheKey) as ComputedRef<unknown[]>
    },
  }
}

// ── Dual-Layer State Machine ────────────────────────────────
// Lightweight reactive implementation of the dual-layer state machine.

function createStateMachine<T, TDomain extends string>(
  isNew: Ref<boolean>,
  entity: Ref<T | null | undefined>,
  getDomainState: (entity: T) => TDomain,
  statePolicy: ScreenStatePolicy<TDomain>,
): { stateMachine: ScreenStateMachine<TDomain>; domain: ComputedRef<TDomain> } {
  const ui = ref<UIState>(isNew.value ? 'NEW' : 'INITIALIZING')

  const domain = computed<TDomain>(() => {
    if (!entity.value) return Object.keys(statePolicy.states)[0] as TDomain
    return getDomainState(entity.value)
  })

  const isEditable = computed(() => {
    if (ui.value !== 'NEW' && ui.value !== 'EDIT') return false
    const behavior = statePolicy.states[domain.value]
    return behavior?.editable ?? false
  })

  const stateMachine: ScreenStateMachine<TDomain> = {
    /** Current UI state */
    ui: computed(() => ui.value) as unknown as UIState,
    /** Current Domain state */
    domain: domain as unknown as TDomain,
    /** Whether the screen is in an editable mode */
    isEditable: isEditable as unknown as boolean,

    /** Transition the UI state */
    transitionUI(newState: UIState) {
      if (ui.value === 'SAVING' && newState === 'INITIALIZING') {
        throw new Error('Illegal state transition: SAVING -> INITIALIZING')
      }
      ui.value = newState
    },

    transitionDomain(newState: TDomain) {
      // Domain state is owned by the backend. This is a placeholder for optimistic updates.
      console.warn(
        `Attempted optimistic Domain transition to ${newState}. Prefer refreshing entity from backend.`,
      )
    },
  }

  return { stateMachine, domain }
}

// ── The Composable ────────────────────────────────────────

/**
 * useScreenController — Platform base composable.
 *
 * Provides the standard lifecycle, granular data access, UI state machine,
 * unified screen model, and command registration that every screen needs.
 *
 * Screen-specific controllers call this internally, then extend it with
 * domain-specific computed properties, watchers, and navigation guards.
 *
 * This is the frontend equivalent of Acumatica's PXGraph base class.
 */
export function useScreenController<T, TDomain extends string = BaseDomainState>(
  options: ScreenControllerOptions<T, TDomain>,
): ScreenController<T, TDomain> {
  const { screen, dataSource, isNew = ref(false), getDomainState, statePolicy } = options

  // ── Data Layer ──
  const data = createScreenData(dataSource.entity)

  // ── State Machine ──
  const { stateMachine, domain } = createStateMachine(
    isNew,
    dataSource.entity,
    getDomainState,
    statePolicy,
  )

  // Sync UI state with data loading lifecycle
  const isLoading = dataSource.isLoading
  const error = dataSource.error
  const degradedBanner = ref<BannerPolicy | undefined>()

  function handleCommandError(error: unknown) {
    if (error instanceof ConflictError) {
      degradedBanner.value = {
        messageKey: error.message,
        variant: 'danger',
      }
      stateMachine.transitionUI('DEGRADED')
    }
  }

  // ── Platform Dialogs ──
  const auditReasonOpen = ref(false)
  const auditReasonValue = ref('')
  const auditReasonTitle = ref('')
  const auditReasonDescription = ref('')
  const pendingCommandExecution = shallowRef<{
    id: string
    command: ControllerCommand
    args: unknown[]
  } | null>(null)

  const dialogs = {
    auditReason: {
      isOpen: auditReasonOpen,
      reason: auditReasonValue,
      title: auditReasonTitle,
      description: auditReasonDescription,
      confirm: () => {
        if (!pendingCommandExecution.value) return
        const { command, args } = pendingCommandExecution.value
        // Inject reason as the last argument if required
        void wrappedExecute(pendingCommandExecution.value.id, command, [
          ...args,
          auditReasonValue.value,
        ])
        auditReasonOpen.value = false
        pendingCommandExecution.value = null
      },
      cancel: () => {
        auditReasonOpen.value = false
        pendingCommandExecution.value = null
      },
    },
    confirmation: {
      isOpen: ref(false),
      title: ref(''),
      description: ref(''),
      variant: ref<'primary' | 'danger'>('primary'),
      confirm: () => {
        if (!pendingCommandExecution.value) return
        const { id, command, args } = pendingCommandExecution.value
        const projection = findProjection(id)

        dialogs.confirmation.isOpen.value = false

        if (projection?.action?.requiresReason) {
          showAuditReason(projection)
        } else {
          void wrappedExecute(id, command, args)
          pendingCommandExecution.value = null
        }
      },
      cancel: () => {
        dialogs.confirmation.isOpen.value = false
        pendingCommandExecution.value = null
      },
    },
  }

  function findProjection(id: string) {
    return (
      model.value.ui.actions.primary.find((p) => p.command.key === id) ||
      model.value.ui.actions.secondary.find((p) => p.command.key === id) ||
      (model.value.ui.actions.expectedNext?.command.key === id
        ? model.value.ui.actions.expectedNext
        : undefined)
    )
  }

  function showAuditReason(projection: CommandProjection) {
    auditReasonTitle.value = projection.action?.label || projection.command.labelKey
    auditReasonDescription.value = `Please provide a reason for the "${
      projection.action?.label || projection.command.labelKey
    }" action.`
    auditReasonValue.value = ''
    auditReasonOpen.value = true
  }

  function showConfirmation(projection: CommandProjection) {
    dialogs.confirmation.title.value = `Confirm ${projection.command.labelKey}`
    dialogs.confirmation.description.value =
      projection.command.confirmationMessageKey || 'Are you sure you want to proceed?'
    dialogs.confirmation.variant.value =
      projection.command.variant === 'danger' ? 'danger' : 'primary'
    dialogs.confirmation.isOpen.value = true
  }

  // ── Command Registry ──
  const commands = ref<Record<string, ControllerCommand>>({})

  async function wrappedExecute(id: string, command: ControllerCommand, args: unknown[]) {
    transitionRecorder.recordTransition(
      { type: 'command', source: `Command(${id})` },
      {
        operations: [
          { op: 'replace', path: 'status', value: 'start' },
          { op: 'replace', path: 'args', value: args },
        ],
      },
      [],
      model.value?.version ?? 0,
    )
    try {
      await command.execute(...args)
      transitionRecorder.recordTransition(
        { type: 'command', source: `Command(${id})` },
        { operations: [{ op: 'replace', path: 'status', value: 'end' }] },
        [],
        model.value?.version ?? 0,
      )
    } catch (error) {
      handleCommandError(error)
      transitionRecorder.recordTransition(
        { type: 'command', source: `Command(${id})` },
        {
          operations: [
            { op: 'replace', path: 'status', value: 'error' },
            {
              op: 'replace',
              path: 'error',
              value: error instanceof Error ? error.message : String(error),
            },
          ],
        },
        [],
        model.value?.version ?? 0,
      )
      throw error
    }
  }

  function registerCommand(id: string, command: ControllerCommand) {
    const wrappedCommand: ControllerCommand = {
      isPending: command.isPending,
      execute: async (...args: unknown[]) => {
        // 1. Find the projection to check for interception requirements
        const projection = findProjection(id)

        // 2. Handle Interception Chain
        // Priority 1: Confirmation
        if (projection?.command.requiresConfirmation) {
          pendingCommandExecution.value = { id, command, args }
          showConfirmation(projection)
          return
        }

        // Priority 2: Audit Reason
        if (projection?.action?.requiresReason) {
          pendingCommandExecution.value = { id, command, args }
          showAuditReason(projection)
          return
        }

        // 3. Direct Execution (No Interception)
        await wrappedExecute(id, command, args)
      },
    }
    commands.value[id] = wrappedCommand
  }

  // ── Aggregate Pending State ──
  const isPending = computed(() => Object.values(commands.value).some((cmd) => cmd.isPending.value))

  // ── Unified Screen Model ──
  const model = computed(() => {
    return resolveScreenProjection({
      screenId: screen.id,
      commands: screen.commands,
      domainState: domain.value,
      operations: options.operations?.value,
      statePolicy,
      sessionBanner: degradedBanner.value,
      forceReadonly: degradedBanner.value !== undefined,
      services: {
        hasNotes: false,
        fileCount: 0,
        hasActivities: false,
      },
      projectionId: crypto.randomUUID(),
      timestamp: Date.now(),
      grids: options.grids?.value,
    })
  })

  // ── Debug: log model changes ──
  watch(
    () => model.value,
    (m) => {
      // In a real system, we'd diff `m` against the previous model and emit a patch.
      // For now, we take a checkpoint.
      transitionRecorder.recordCheckpoint(
        {
          projectionId: m.meta.projectionId,
          runtimeSessionId: 'local-session',
          projectionType: 'screen',
          schemaVersion: 1,
          runtimeVersion: '1.0.0',
          entityId: (dataSource.entity.value as { id?: string } | null)?.id,
          timestamp: m.meta.timestamp,
          payload: m,
        },
        m.version,
      )
    },
    { immediate: true },
  )

  // ── Cleanup ──
  onUnmounted(() => {
    // Future: tear down subscriptions, release memory
  })

  return {
    /** The ScreenDefinition metadata */
    screen,

    /** Granular, memoized data access */
    data,

    /** The primary entity ref (for direct access when selectors aren't needed) */
    entity: dataSource.entity,

    /** UI state machine */
    state: stateMachine,

    /** The unified screen model — single deterministic rendering contract */
    model,

    /** Whether the data source is loading */
    isLoading,

    /** Error from the data source */
    error,

    /** Whether this is a new record */
    isNew,

    /** Registered commands (populated by screen-specific controller) */
    commands: commands as Ref<Record<string, ControllerCommand>>,

    /** Platform-managed dialog states */
    dialogs,

    /** Register a command on this controller */
    registerCommand,

    /** Let the platform react to command errors that occur outside registerCommand wrappers */
    handleCommandError,

    /** Whether any command is currently executing */
    isPending,
  }
}
