import type { Account } from '../../../domain/account.types'

/**
 * Returns a color-coded representation for the UI based on account type
 */
export function getAccountTypeColor(type: string): string {
  const colorMap: Record<string, string> = {
    asset: '#22c55e',
    liability: '#f59e0b',
    equity: '#818cf8',
    revenue: '#38bdf8',
    expense: '#f87171',
  }
  return colorMap[type?.toLowerCase()] ?? '#94a3b8'
}

/**
 * Returns the full display name for an account
 */
export function getAccountDisplayName(account: Account): string {
  return `${account.code} — ${account.name}`
}

/**
 * Returns formatted status label
 */
export function getAccountStatusLabel(isActive: boolean): string {
  return isActive ? 'Active' : 'Inactive'
}
