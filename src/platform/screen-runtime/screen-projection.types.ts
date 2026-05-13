import type { ScreenCommand } from '../commands/command.types'
import type {
  BannerPolicy,
  SectionStateOverride,
  FieldStateOverride,
} from './screen-state-policy.types'
import type { ActionDescriptor, FullOperations } from '../workflow-runtime/models/workflows.types'

export interface CommandProjection {
  readonly command: ScreenCommand
  readonly action?: ActionDescriptor
  readonly visible: boolean
  readonly enabled: boolean
  readonly reason?: string
  // future: loading, emphasis
}

/**
 * ScreenProjection
 *
 * The single deterministic rendering contract for a screen.
 * It is produced by a pure function mapping the Controller's state + metadata -> Screen Projection.
 *
 * 100% JSON-serializable, zero functions.
 */
export interface ScreenProjection {
  readonly version: 1
  readonly meta: {
    readonly screenId: string
    readonly projectionId: string
    readonly timestamp: number
  }

  /** 1. Domain Constraints (Backend-Derived Truth) */
  readonly domain: {
    readonly backend: {
      readonly status?: string
      readonly operations?: FullOperations
    }
    readonly capabilities: {
      readonly canEdit: boolean
      readonly canDelete: boolean
    }
    readonly services: {
      readonly hasNotes: boolean
      readonly fileCount: number
      readonly hasActivities: boolean
    }
  }

  /** 2. UI Presentation (Frontend-Derived Rendering) */
  readonly ui: {
    readonly chrome: {
      readonly banner?: BannerPolicy
      readonly actionRequiredLabel?: string
    }
    readonly actions: {
      readonly expectedNext?: CommandProjection
      readonly primary: readonly CommandProjection[]
      readonly secondary: readonly CommandProjection[]
    }
    readonly layout: {
      readonly sections: Record<string, SectionStateOverride>
    }
    readonly fields: {
      readonly overrides: Record<string, FieldStateOverride>
    }
    readonly grids: {
      readonly state: Record<string, unknown> // Future: formalize GridProjection interface
    }
  }
}
