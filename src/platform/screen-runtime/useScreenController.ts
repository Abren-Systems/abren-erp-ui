import { ref, computed, watch, onUnmounted, type ComputedRef, type Ref } from 'vue'
import type { ScreenDefinition } from './screen-definition.types'
import type { ScreenData, ControllerCommand, ScreenController } from './screen-controller.types'
import type { UIState, BaseDomainState, ScreenStateMachine } from './state-machine.types'
import type { ScreenStatePolicy } from './screen-state-policy.types'
import { interpretStatePolicy, type InterpretedState } from './interpret-state-policy'
import { debugBus } from '../debug/debug-bus'

// ── Screen Controller Options ─────────────────────────────
// Passed by the screen-specific controller to configure data loading.

export interface ScreenControllerDataSource<T> {
  /** The reactive entity (from TanStack Query or form state) */
  readonly entity: Ref<T | null | undefined>
  /** Whether the data source is loading */
  readonly isLoading: Ref<boolean>
  /** Error from the data source, if any */
  readonly error: Ref<Error | null | undefined>
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
  /** Per-screen state policy — drives editability and field overrides */
  readonly statePolicy: ScreenStatePolicy<TDomain>
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
): { stateMachine: ScreenStateMachine<TDomain>; interpretedState: ComputedRef<InterpretedState> } {
  const ui = ref<UIState>(isNew.value ? 'NEW' : 'INITIALIZING')

  const domain = computed<TDomain>(() => {
    if (!entity.value) return Object.keys(statePolicy.states)[0] as TDomain
    return getDomainState(entity.value)
  })

  // Interpreted state — the single truth for all consumers
  const interpretedState = computed<InterpretedState>(() =>
    interpretStatePolicy(statePolicy, domain.value),
  )

  const isEditable = computed(() => {
    if (ui.value !== 'NEW' && ui.value !== 'EDIT') return false
    return interpretedState.value.editable
  })

  const stateMachine: ScreenStateMachine<TDomain> = {
    /** Current UI state */
    ui: computed(() => ui.value) as unknown as UIState, // Type cast to satisfy interface while remaining reactive to Vue template
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
      // In this frontend architecture, Domain state is owned by the backend.
      // This method is a placeholder for optimistic updates if necessary,
      // but normally we just refresh the entity after a successful command.
      console.warn(
        `Attempted optimistic Domain transition to ${newState}. Prefer refreshing entity from backend.`,
      )
    },
  }

  return { stateMachine, interpretedState }
}

// ── The Composable ────────────────────────────────────────

/**
 * useScreenController — Platform base composable.
 *
 * Provides the standard lifecycle, granular data access, UI state machine,
 * interpreted state policy, and command registration that every screen needs.
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

  // ── State Machine + Interpreted State ──
  const { stateMachine, interpretedState } = createStateMachine(
    isNew,
    dataSource.entity,
    getDomainState,
    statePolicy,
  )

  // Sync UI state with data loading lifecycle
  const isLoading = dataSource.isLoading
  const error = dataSource.error

  // ── Command Registry ──
  const commands = ref<Record<string, ControllerCommand>>({})

  function registerCommand(id: string, command: ControllerCommand) {
    // Wrap execute() with debug instrumentation
    const wrappedCommand: ControllerCommand = {
      isPending: command.isPending,
      execute: async (...args: unknown[]) => {
        debugBus.emit(screen.id, 'command_start', { commandId: id, args })
        try {
          await command.execute(...args)
          debugBus.emit(screen.id, 'command_end', { commandId: id })
        } catch (error) {
          debugBus.emit(screen.id, 'command_error', {
            commandId: id,
            error: error instanceof Error ? error.message : String(error),
          })
          throw error
        }
      },
    }
    commands.value[id] = wrappedCommand
    debugBus.emit(screen.id, 'command_registered', { commandId: id })
  }

  // ── Aggregate Pending State ──
  const isPending = computed(() => Object.values(commands.value).some((cmd) => cmd.isPending.value))

  // ── Debug: log policy interpretation on domain state changes ──
  watch(
    () => interpretedState.value,
    (interpreted) => {
      debugBus.emit(screen.id, 'policy_interpreted', {
        editable: interpreted.editable,
        actionRequiredLabel: interpreted.actionRequiredLabel,
      })
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

    /** Interpreted state policy — the single truth for field/editability behavior */
    interpretedState,

    /** Whether the data source is loading */
    isLoading,

    /** Error from the data source */
    error,

    /** Whether this is a new record */
    isNew,

    /** Registered commands (populated by screen-specific controller) */
    commands: commands as Ref<Record<string, ControllerCommand>>,

    /** Register a command on this controller */
    registerCommand,

    /** Whether any command is currently executing */
    isPending,

    /** Workflow projection */
    workflow: {
      availableActions: computed(() => {
        const ent = dataSource.entity.value as Record<string, unknown> | null
        return (ent?.['available_actions'] || []) as readonly string[]
      }),
    },
  }
}
