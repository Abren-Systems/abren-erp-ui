import { describe, it, expect, beforeEach } from 'vitest'
import { eventBus } from '../event-bus'

describe('TypedEventBus', () => {
  beforeEach(() => {
    eventBus.clear()
  })

  it('should emit and receive events', () => {
    let received = false
    eventBus.on('payment-request:submitted', ({ id }) => {
      expect(id).toBe('pr-123')
      received = true
    })

    eventBus.emit('payment-request:submitted', { id: 'pr-123' })
    expect(received).toBe(true)
  })

  it('should return unsubscribe function', () => {
    let callCount = 0
    const unsub = eventBus.on('payment-request:submitted', () => {
      callCount++
    })

    eventBus.emit('payment-request:submitted', { id: '1' })
    expect(callCount).toBe(1)

    unsub()
    eventBus.emit('payment-request:submitted', { id: '2' })
    expect(callCount).toBe(1) // Still 1 — unsubscribed
  })

  it('should support multiple listeners', () => {
    let count = 0
    eventBus.on('journal-entry:posted', () => count++)
    eventBus.on('journal-entry:posted', () => count++)
    eventBus.emit('journal-entry:posted', { id: '1', entryNumber: 'JE-001' })
    expect(count).toBe(2)
  })

  it('should clear all listeners', () => {
    let called = false
    eventBus.on('auth:logged-out', () => { called = true })
    eventBus.clear()
    eventBus.emit('auth:logged-out', {})
    expect(called).toBe(false)
  })
})
