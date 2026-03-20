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
class TypedEventBus {
    listeners = new Map();
    emit(event, payload) {
        const handlers = this.listeners.get(event);
        if (handlers) {
            handlers.forEach((handler) => handler(payload));
        }
    }
    on(event, handler) {
        const key = event;
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(handler);
        // Return unsubscribe function (for onUnmounted cleanup)
        return () => this.off(event, handler);
    }
    off(event, handler) {
        const handlers = this.listeners.get(event);
        if (handlers) {
            handlers.delete(handler);
        }
    }
    /** Remove all listeners — useful for testing */
    clear() {
        this.listeners.clear();
    }
}
export const eventBus = new TypedEventBus();
