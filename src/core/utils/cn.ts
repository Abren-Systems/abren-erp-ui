/**
 * cn — Tailwind-aware class name utility
 *
 * Combines `clsx` (conditional class joining) with `tailwind-merge` (conflict resolution).
 * This ensures that when two Tailwind utilities target the same CSS property
 * (e.g., `p-2` and `p-4`), the last one wins instead of both being applied.
 *
 * Use this everywhere instead of plain string concatenation or bare `clsx`.
 *
 * @example
 *   cn('px-4 py-2', isActive && 'bg-primary-600', 'py-3')
 *   // → 'px-4 bg-primary-600 py-3'  (py-2 is overridden by py-3)
 */
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
