import type { Brand } from '@/shared/types/brand.types'

// ── Branded Identifiers for the Screen Runtime ────────────
// These follow the same Brand pattern used throughout Abren's domain layer.

/** A stable screen identifier (e.g., 'AP301000', 'GL101000') */
export type ScreenId = Brand<string, 'ScreenId'>

/** A globally unique identifier for an open screen tab/instance */
export type ScreenInstanceId = Brand<string, 'ScreenInstanceId'>

export function createScreenId(id: string): ScreenId {
  return id as ScreenId
}
