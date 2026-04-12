/**
 * Typed Event Bus — Cross-Module Communication
 *
 * Modules NEVER import each other's stores.
 * When Module A's action should refresh Module B's data, use this bus.
 * Mirrors the backend's domain event system.
 *
 * Usage:
 *   eventBus.emit('payment-request:paid', { id, amount })
 *   eventBus.on('payment-request:paid', (payload) => { ... })
 */

import type { Money } from '../domain/money'
import type { IsoDate } from '../domain/business-date'
import { BusinessDate } from '../domain/business-date'
import type {
  EventId,
  UserId,
  ModuleId,
  PaymentRequestId,
  VendorBillId,
  JournalEntryId,
} from '../types/brand.types'
import { toId } from '../types/brand.types'

/**
 * Metadata for every cross-module event.
 * Mirrors the backend's high-integrity event envelope.
 */
export interface AppEventMetadata {
  readonly id: EventId
  readonly timestamp: IsoDate // ISO UTC
  readonly actorId: UserId | null
  readonly sourceModule: ModuleId
}

/**
 * Standardized Event Wrapper
 */
export interface AppEvent<K extends keyof EventMap, T = EventMap[K]> {
  readonly type: K
  readonly metadata: AppEventMetadata
  readonly payload: T
}

// ── Event Map (Add new events here) ───────────────────
export type EventMap = {
  'payment-request:submitted': { id: PaymentRequestId }
  'payment-request:approved': { id: PaymentRequestId }
  'payment-request:rejected': { id: PaymentRequestId; reason: string }
  'payment-request:paid': { id: PaymentRequestId; amount: Money }
  'vendor-bill:created': { id: VendorBillId }
  'vendor-bill:validated': { id: VendorBillId }
  'journal-entry:posted': { id: JournalEntryId; entryNumber: string }
  'journal-entry:voided': { id: JournalEntryId }
  'tenant:feature-toggled': { feature: string; enabled: boolean }
  'auth:logged-out': Record<string, never>
  'workflow:action-completed': Record<string, never>
}

// ── Implementation ────────────────────────────────────
type Handler<T> = (event: AppEvent<keyof EventMap, T>) => void

class TypedEventBus {
  private listeners = new Map<string, Set<Handler<unknown>>>()

  /**
   * Emit a Fat Domain Event.
   * Automatically generates stable metadata.
   */
  emit<K extends keyof EventMap>(
    event: K,
    payload: EventMap[K],
    metadataOverrides?: Partial<AppEventMetadata>,
  ): void {
    const handlers = this.listeners.get(event as string)
    if (!handlers) return

    const appEvent: AppEvent<K, EventMap[K]> = {
      type: event,
      metadata: {
        id: toId<EventId>(crypto.randomUUID()),
        timestamp: BusinessDate.today(),
        actorId: metadataOverrides?.actorId ?? null,
        sourceModule: metadataOverrides?.sourceModule ?? toId<ModuleId>('shared'),
      },
      payload,
    }

    handlers.forEach((handler) => handler(appEvent as AppEvent<keyof EventMap, unknown>))
  }

  on<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>): () => void {
    const key = event as string
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }
    this.listeners.get(key)!.add(handler as Handler<unknown>)

    return () => this.off(event, handler)
  }

  off<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>): void {
    const handlers = this.listeners.get(event as string)
    if (handlers) {
      handlers.delete(handler as Handler<unknown>)
    }
  }

  clear(): void {
    this.listeners.clear()
  }
}

export const eventBus = new TypedEventBus()
