import { describe, it, expect, beforeEach } from 'vitest'
import { eventBus } from '../event-bus'
import { toId, type PaymentRequestId, type JournalEntryId } from '../../types/brand.types'

describe('TypedEventBus', () => {
  beforeEach(() => {
    eventBus.clear()
  })

  it('should emit and receive events with metadata', () => {
    let received = false
    const testId = toId<PaymentRequestId>('pr-123')

    eventBus.on('payment-request:submitted', (event) => {
      expect(event.payload.id).toBe(testId)
      expect(event.metadata.id).toBeDefined()
      expect(event.metadata.timestamp).toBeDefined()
      received = true
    })

    eventBus.emit('payment-request:submitted', { id: testId })
    expect(received).toBe(true)
  })

  it('should return unsubscribe function', () => {
    let callCount = 0
    const unsub = eventBus.on('payment-request:submitted', () => {
      callCount++
    })

    eventBus.emit('payment-request:submitted', {
      id: toId<PaymentRequestId>('1'),
    })
    expect(callCount).toBe(1)

    unsub()
    eventBus.emit('payment-request:submitted', {
      id: toId<PaymentRequestId>('2'),
    })
    expect(callCount).toBe(1) // Still 1 — unsubscribed
  })

  it('should support multiple listeners', () => {
    let count = 0
    eventBus.on('journal-entry:posted', () => count++)
    eventBus.on('journal-entry:posted', () => count++)
    eventBus.emit('journal-entry:posted', {
      id: toId<JournalEntryId>('1'),
      entryNumber: 'JE-001',
    })
    expect(count).toBe(2)
  })

  it('should clear all listeners', () => {
    let called = false
    eventBus.on('auth:logged-out', () => {
      called = true
    })
    eventBus.clear()
    eventBus.emit('auth:logged-out', {})
    expect(called).toBe(false)
  })
})
