/**
 * Shared Domain Types — Branded Types for Type Safety
 *
 * These types prevent accidentally passing a raw string
 * where a UUID or TenantId is expected.
 */

// Branded type utility
type Brand<T, B> = T & { __brand: B }

// Domain IDs
export type UUID = Brand<string, 'UUID'>
export type TenantId = Brand<string, 'TenantId'>
export type UserId = Brand<string, 'UserId'>

// Workflow statuses (mirrors backend enums)
export type PaymentRequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAID'
  | 'VOIDED'

export type JournalEntryStatus = 'DRAFT' | 'POSTED' | 'VOIDED'
