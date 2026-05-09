/**
 * Debug - Trace Types
 *
 * Defines the strongly-typed explanation payloads for the Transition Recorder.
 * These traces explain *why* a projection structurally changed.
 */

export type TraceKind =
  | 'capability_trace'
  | 'policy_trace'
  | 'visibility_trace'
  | 'semantic_trace'
  | 'validation_trace'

export interface BaseTrace {
  kind: TraceKind
  timestamp: number
  /** The target field, command, or structural element */
  targetId: string
}

export interface CapabilityTrace extends BaseTrace {
  kind: 'capability_trace'
  capability: string
  previousValue: boolean
  nextValue: boolean
  reason: string
}

export interface PolicyTrace extends BaseTrace {
  kind: 'policy_trace'
  policyId: string
  action: 'enforced' | 'bypassed'
  reason: string
}

export interface VisibilityTrace extends BaseTrace {
  kind: 'visibility_trace'
  previousValue: boolean
  nextValue: boolean
  evaluatorId: string
}

export interface SemanticTrace extends BaseTrace {
  kind: 'semantic_trace'
  semanticKind: string
  formatterKey: string
  displayPolicy: string
}

export interface ValidationTrace extends BaseTrace {
  kind: 'validation_trace'
  ruleId: string
  passed: boolean
  errorKey?: string
}

export type RuntimeTrace =
  | CapabilityTrace
  | PolicyTrace
  | VisibilityTrace
  | SemanticTrace
  | ValidationTrace
