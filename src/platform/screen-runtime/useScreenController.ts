import { ref, computed, onUnmounted, type ComputedRef, type Ref } from 'vue'
import type { ScreenDefinition } from './screen-definition.types'
import type { ScreenData } from './screen-controller.types'
import type { UIState } from './state-machine.types'

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

export interface ScreenControllerOptions<T> {
  /** The ScreenDefinition metadata */
  readonly screen: ScreenDefinition
  /** The primary data source — wired by the screen-specific controller */
  readonly dataSource: ScreenControllerDataSource<T>
  /** Whether this is a new record (creation mode) */
  readonly isNew?: Ref<boolean>
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

// ── UI State Machine ──────────────────────────────────────
// Lightweight reactive implementation of the dual-layer state machine.

function createUIStateMachine(isNew: Ref<boolean>) {
  const ui = ref<UIState>(isNew.value ? 'NEW' : 'INITIALIZING')

  const isEditable = computed(() => ui.value === 'NEW' || ui.value === 'EDIT')

  return {
    /** Current UI state */
    ui: computed(() => ui.value),
    /** Whether the screen is in an editable mode */
    isEditable,

    /** Transition the UI state */
    transitionUI(newState: UIState) {
      ui.value = newState
    },
  }
}

// ── Command Registry ──────────────────────────────────────
// Screens register their commands via registerCommand().
// The view template reads from commands for rendering.

export interface ControllerCommand {
  /** Execute this command */
  execute: (...args: unknown[]) => Promise<void>
  /** Whether the command is currently executing */
  isPending: Ref<boolean>
}

// ── The Composable ────────────────────────────────────────

/**
 * useScreenController — Platform base composable.
 *
 * Provides the standard lifecycle, granular data access, UI state machine,
 * and command registration that every screen needs.
 *
 * Screen-specific controllers call this internally, then extend it with
 * domain-specific computed properties, watchers, and navigation guards.
 *
 * This is the frontend equivalent of Acumatica's PXGraph base class.
 */
export function useScreenController<T>(options: ScreenControllerOptions<T>) {
  const { screen, dataSource, isNew = ref(false) } = options

  // ── Data Layer ──
  const data = createScreenData(dataSource.entity)

  // ── State Machine ──
  const uiState = createUIStateMachine(isNew)

  // Sync UI state with data loading lifecycle
  const isLoading = dataSource.isLoading
  const error = dataSource.error

  // ── Command Registry ──
  const commands = ref<Record<string, ControllerCommand>>({})

  function registerCommand(id: string, command: ControllerCommand) {
    commands.value[id] = command
  }

  // ── Aggregate Pending State ──
  const isPending = computed(() => Object.values(commands.value).some((cmd) => cmd.isPending.value))

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
    state: uiState,

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
  }
}

/** The return type of useScreenController, for use in screen-specific controllers */
export type ScreenControllerInstance<T> = ReturnType<typeof useScreenController<T>>
