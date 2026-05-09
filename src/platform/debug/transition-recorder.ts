import type { ProjectionEnvelope } from '../core-runtime/projection.types'
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

  /** The delta (diff) from the previous projection. We don't store full blobs here. */
  patch: Record<string, unknown>

  traces: RuntimeTrace[]
  projectionVersion: number
}

export interface ProjectionCheckpoint<T> {
  version: number
  timestamp: number
  fullProjection: ProjectionEnvelope<T>
}

type Subscriber = (transition: RuntimeTransition) => void

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
  recordCheckpoint<T>(envelope: ProjectionEnvelope<T>) {
    if (!this._enabled) return

    const checkpoint: ProjectionCheckpoint<T> = {
      version: envelope.schemaVersion,
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
    patch: Record<string, unknown>,
    traces: RuntimeTrace[],
    projectionVersion: number,
  ) {
    if (!this._enabled) return

    const transition: RuntimeTransition = {
      id: `tr_${this.nextTransitionId++}`,
      timestamp: performance.now(),
      trigger,
      patch,
      traces,
      projectionVersion,
    }

    this.transitions.push(transition)

    // Bound memory
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
