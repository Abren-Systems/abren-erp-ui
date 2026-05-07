// ── Debug Bus ─────────────────────────────────────────────
// A lightweight, zero-overhead-in-production event log for
// observing screen controller behavior at runtime.
//
// Ring buffer design — no reactivity, no Pinia, no store.
// Consumers poll or subscribe; no Vue watchers are created.
//
// Instrumented at two chokepoints:
//   1. useScreenController.registerCommand() — wraps execute() to emit before/after
//   2. useField.onChange() — emits field mutations

export type DebugEventKind =
  | 'command_registered'
  | 'command_start'
  | 'command_end'
  | 'command_error'
  | 'field_mutation'
  | 'state_transition'
  | 'model_resolved'

export interface DebugEvent {
  /** Monotonically increasing event ID */
  readonly id: number
  /** High-resolution timestamp */
  readonly timestamp: number
  /** The screen that emitted this event */
  readonly screenId: string
  /** Event classification */
  readonly kind: DebugEventKind
  /** Arbitrary payload — shape depends on `kind` */
  readonly payload: Record<string, unknown>
}

type DebugSubscriber = (event: DebugEvent) => void

const MAX_EVENTS = 200

class DebugBusImpl {
  private events: DebugEvent[] = []
  private nextId = 1
  private subscribers = new Set<DebugSubscriber>()
  private _enabled = import.meta.env.DEV

  /** Whether the debug bus is active. No-op in production. */
  get enabled(): boolean {
    return this._enabled
  }

  set enabled(value: boolean) {
    this._enabled = value
  }

  /**
   * Emit a debug event. No-op if disabled (production).
   */
  emit(screenId: string, kind: DebugEventKind, payload: Record<string, unknown> = {}): void {
    if (!this._enabled) return

    const event: DebugEvent = {
      id: this.nextId++,
      timestamp: performance.now(),
      screenId,
      kind,
      payload,
    }

    this.events.push(event)

    // Ring buffer — evict oldest when full
    if (this.events.length > MAX_EVENTS) {
      this.events.splice(0, this.events.length - MAX_EVENTS)
    }

    // Notify subscribers
    for (const sub of this.subscribers) {
      try {
        sub(event)
      } catch {
        // Never let a subscriber crash the bus
      }
    }
  }

  /** Get all buffered events (oldest first). */
  getEvents(): readonly DebugEvent[] {
    return this.events
  }

  /** Get the last N events. */
  getRecent(count: number): readonly DebugEvent[] {
    return this.events.slice(-count)
  }

  /** Filter events by screen. */
  getByScreen(screenId: string): readonly DebugEvent[] {
    return this.events.filter((e) => e.screenId === screenId)
  }

  /** Subscribe to new events. Returns an unsubscribe function. */
  subscribe(fn: DebugSubscriber): () => void {
    this.subscribers.add(fn)
    return () => this.subscribers.delete(fn)
  }

  /** Clear all buffered events. */
  clear(): void {
    this.events = []
  }
}

/**
 * Singleton debug bus instance.
 * Access from anywhere: `import { debugBus } from '@/platform/debug/debug-bus'`
 */
export const debugBus = new DebugBusImpl()
