import type { ProjectionEnvelope, ProjectionPatch } from '../core-runtime/projection.types'
import type { RuntimeTrace } from './trace.types'

/**
 * Transition Recorder
 *
 * A passive read-only oscilloscope that monitors the execution pipeline.
 * It records exact state transitions (patches) and traces without orchestrating
 * or participating in the runtime.
 */

export interface TransitionTrigger {
  type: 'command' | 'mutation' | 'navigation' | 'initial'
  source: string
}

export interface RuntimeTransition {
  id: string
  timestamp: number
  trigger: TransitionTrigger

  /**
   * The formal patch representing the delta from the previous projection.
   * MUST use path-based semantics for deterministic replay.
   */
  patch: ProjectionPatch

  traces: RuntimeTrace[]

  /** Monotonically increasing revision of the specific projection lineage */
  projectionRevision: number
}

export interface ProjectionCheckpoint<T> {
  revision: number
  timestamp: number
  fullProjection: ProjectionEnvelope<T>
}

type Subscriber = (transition: RuntimeTransition) => void

/**
 * Checkpoint Strategy:
 * - On every Navigation boundary (Screen change)
 * - Every 50 transitions within the same projection lineage
 * - On explicit Command completion for high-stakes workflows
 */

class TransitionRecorderImpl {
  private transitions: RuntimeTransition[] = []
  // We keep the last known checkpoints for each projection ID
  private checkpoints = new Map<string, ProjectionCheckpoint<unknown>>()
  private subscribers = new Set<Subscriber>()
  private nextTransitionId = 1
  private _enabled = import.meta.env.DEV

  get enabled(): boolean {
    return this._enabled
  }

  set enabled(value: boolean) {
    this._enabled = value
  }

  /**
   * Record a full checkpoint. This acts as a base state from which subsequent
   * patches can be applied during a replay.
   */
  recordCheckpoint<T>(envelope: ProjectionEnvelope<T>, revision: number) {
    if (!this._enabled) return

    const checkpoint: ProjectionCheckpoint<T> = {
      revision,
      timestamp: envelope.timestamp,
      fullProjection: envelope,
    }

    this.checkpoints.set(envelope.projectionId, checkpoint)
  }

  /**
   * Record a transition (patch).
   */
  recordTransition(
    trigger: TransitionTrigger,
    patch: ProjectionPatch,
    traces: RuntimeTrace[],
    projectionRevision: number,
  ) {
    if (!this._enabled) return

    const transition: RuntimeTransition = {
      id: `tr_${this.nextTransitionId++}`,
      timestamp: performance.now(),
      trigger,
      patch,
      traces,
      projectionRevision,
    }

    this.transitions.push(transition)

    // Bound memory (Circular buffer behavior)
    if (this.transitions.length > 500) {
      this.transitions.shift()
    }

    // Notify DevTools subscribers
    for (const sub of this.subscribers) {
      try {
        sub(transition)
      } catch {
        // Passive failure only
      }
    }
  }

  subscribe(fn: Subscriber): () => void {
    this.subscribers.add(fn)
    return () => this.subscribers.delete(fn)
  }

  getTransitions(): readonly RuntimeTransition[] {
    return this.transitions
  }

  getCheckpoints(): readonly ProjectionCheckpoint<unknown>[] {
    return Array.from(this.checkpoints.values())
  }
}

export const transitionRecorder = new TransitionRecorderImpl()
