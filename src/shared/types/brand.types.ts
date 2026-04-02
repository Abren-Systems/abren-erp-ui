/**
 * TypeScript Opaque / Branded Types
 *
 * Used to enforce strict type-safety for Identifiers across the application domain.
 * Prevents accidentally passing a \`UserId\` into a function expecting a \`TenantId\`.
 */
export type Brand<K, T> = K & { readonly __brand: T }

// ── Core Domain Identifiers ───────────────────────────────

export type TenantId = Brand<string, 'TenantId'>
export type UserId = Brand<string, 'UserId'>
export type RoleId = Brand<string, 'RoleId'>
export type EventId = Brand<string, 'EventId'>
export type AuditLogId = Brand<string, 'AuditLogId'>
export type ModuleId = Brand<string, 'ModuleId'>

// ── Business Domain Identifiers ───────────────────────────

export type AccountId = Brand<string, 'AccountId'>
export type JournalEntryId = Brand<string, 'JournalEntryId'>
export type JournalLineId = Brand<string, 'JournalLineId'>
export type FiscalPeriodId = Brand<string, 'FiscalPeriodId'>
export type PaymentRequestId = Brand<string, 'PaymentRequestId'>
export type PaymentRequestLineId = Brand<string, 'PaymentRequestLineId'>
export type VendorBillId = Brand<string, 'VendorBillId'>
export type VendorBillLineId = Brand<string, 'VendorBillLineId'>
export type VendorId = Brand<string, 'VendorId'>
export type CategoryId = Brand<string, 'CategoryId'>
export type BankAccountId = Brand<string, 'BankAccountId'>
export type BankTransactionId = Brand<string, 'BankTransactionId'>
export type WorkflowInstanceId = Brand<string, 'WorkflowInstanceId'>

/**
 * Utility function to safely cast a raw string DTO ID into a Domain Branded ID.
 * Should exclusively be used inside \`infrastructure/mappers\`.
 */
export function toId<T extends string>(id: string): T {
  return id as Extract<T, string>
}
