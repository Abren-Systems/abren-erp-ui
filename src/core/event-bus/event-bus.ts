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

// ── Event Map (Add new events here) ───────────────────
export type EventMap = {
  'payment-request:submitted': { id: string }
  'payment-request:approved': { id: string }
  'payment-request:rejected': { id: string; reason: string }
  'payment-request:paid': { id: string; amount: Money }
  'journal-entry:posted': { id: string; entryNumber: string }
  'journal-entry:voided': { id: string }
  'tenant:feature-toggled': { feature: string; enabled: boolean }
  'auth:logged-out': Record<string, never>
}

// ── Implementation ────────────────────────────────────
type Handler<T> = (payload: T) => void

class TypedEventBus {
  private listeners = new Map<string, Set<Handler<unknown>>>()

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    const handlers = this.listeners.get(event as string)
    if (handlers) {
      handlers.forEach((handler) => handler(payload))
    }
  }

  on<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>): () => void {
    const key = event as string
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }
    this.listeners.get(key)!.add(handler as Handler<unknown>)

    // Return unsubscribe function (for onUnmounted cleanup)
    return () => this.off(event, handler)
  }

  off<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>): void {
    const handlers = this.listeners.get(event as string)
    if (handlers) {
      handlers.delete(handler as Handler<unknown>)
    }
  }

  /** Remove all listeners — useful for testing */
  clear(): void {
    this.listeners.clear()
  }
}

export const eventBus = new TypedEventBus()
