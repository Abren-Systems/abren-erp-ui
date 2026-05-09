import { describe, it, expect, vi } from 'vitest'
import { resolveScreenProjection } from '../resolve-screen-model'
import type { ScreenCommand } from '../../commands/command.types'
import type { ScreenStatePolicy } from '../screen-state-policy.types'

// Mock crypto.randomUUID for deterministic snapshots
vi.spyOn(crypto, 'randomUUID').mockReturnValue('00000000-0000-0000-0000-000000000000')
// Mock Date.now for deterministic snapshots
vi.spyOn(Date, 'now').mockReturnValue(1715068800000)

describe('resolveScreenProjection', () => {
  const mockCommands: ScreenCommand[] = [
    {
      key: 'save',
      labelKey: 'Save',
      displayOnMainToolbar: true,
      kind: 'local',
      variant: 'primary',
    },
    {
      key: 'RELEASE',
      labelKey: 'Release',
      displayOnMainToolbar: true,
      kind: 'workflow',
      variant: 'primary',
    },
    {
      key: 'VOID',
      labelKey: 'Void',
      displayOnMainToolbar: false,
      kind: 'workflow',
      variant: 'danger',
    },
  ]

  const mockPolicy: ScreenStatePolicy<'DRAFT' | 'RELEASED'> = {
    states: {
      DRAFT: {
        editable: true,
        deletable: true,
        fields: {
          vendorId: { required: true },
          totalAmount: { readonly: true },
        },
      },
      RELEASED: {
        editable: false,
        banner: {
          messageKey: 'Record is released and read-only',
          variant: 'info',
        },
      },
    },
  }

  it('should resolve a valid model for DRAFT state', () => {
    const model = resolveScreenProjection({
      screenId: 'AP301000',
      commands: mockCommands,
      domainState: 'DRAFT',
      availableActions: ['RELEASE'],
      statePolicy: mockPolicy,
    })

    expect(model).toMatchSnapshot()

    // Explicit assertions for critical paths
    expect(model.domain.capabilities.canEdit).toBe(true)
    expect(model.domain.capabilities.canDelete).toBe(true)
    expect(model.domain.services.fileCount).toBe(0) // Default if undefined
    expect(model.ui.actions.expectedNext?.command.key).toBe('RELEASE')
    expect(model.ui.fields.overrides.vendorId.required).toBe(true)
  })

  it('should resolve a valid model for RELEASED state', () => {
    const model = resolveScreenProjection({
      screenId: 'AP301000',
      commands: mockCommands,
      domainState: 'RELEASED',
      availableActions: [],
      statePolicy: mockPolicy,
    })

    expect(model).toMatchSnapshot()

    expect(model.domain.capabilities.canEdit).toBe(false)
    expect(model.domain.capabilities.canDelete).toBe(false)
    expect(model.ui.chrome.banner?.variant).toBe('info')
    expect(model.ui.actions.expectedNext).toBeUndefined()
  })

  it('should filter out hidden commands in the projection', () => {
    const model = resolveScreenProjection({
      screenId: 'AP301000',
      commands: mockCommands,
      domainState: 'RELEASED',
      availableActions: [], // Void requires 'VOID' in availableActions
      statePolicy: mockPolicy,
    })

    // 'release' and 'void' should be hidden because they are workflow actions not in availableActions
    expect(model.ui.actions.primary).toHaveLength(1) // Only 'save' remains (standard commands are usually visible)
    expect(model.ui.actions.secondary).toHaveLength(0)
  })

  it('[SBI-01] should produce a 100% JSON-serializable model with no reactive refs or functions', () => {
    const model = resolveScreenProjection({
      screenId: 'AP301000',
      commands: mockCommands,
      domainState: 'DRAFT',
      availableActions: ['RELEASE'],
      statePolicy: mockPolicy,
    })

    const stringified = JSON.stringify(model)
    const parsed = JSON.parse(stringified)

    // The parsed model must perfectly deep-equal the original model.
    // If the original model contained functions, undefined, Symbols, or proxies,
    // JSON serialization would drop/alter them and the assertion would fail.
    expect(parsed).toEqual(model)
  })
})
