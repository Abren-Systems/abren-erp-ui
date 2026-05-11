import { toValue, type MaybeRefOrGetter } from 'vue'

export type OccVersionSource = MaybeRefOrGetter<number | null | undefined>

export function resolveOccVersion(version: OccVersionSource): number {
  const value = toValue(version)
  if (value == null) {
    throw new Error('Missing OCC version for this mutation.')
  }
  return value
}
