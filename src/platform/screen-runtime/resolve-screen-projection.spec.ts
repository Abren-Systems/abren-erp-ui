import { describe, it, expect } from 'vitest'
import { resolveScreenProjection } from './resolve-screen-projection'
import type { ScreenCommand } from '../commands/command.types'

describe('resolveScreenProjection', () => {
  const commands: ScreenCommand[] = [
    {
      key: 'submit',
      labelKey: 'Submit',
      variant: 'primary',
      kind: 'workflow',
      from: ['DRAFT'],
      displayOnMainToolbar: true,
    },
    {
      key: 'cancel',
      labelKey: 'Cancel',
      variant: 'danger',
      kind: 'workflow',
      from: ['DRAFT'],
      displayOnMainToolbar: true,
    },
    {
      key: 'export',
      labelKey: 'Export',
      variant: 'neutral',
      kind: 'utility',
      categoryKey: 'other',
    },
  ]

  it('projects correctly when workflow command is available', () => {
    // Both 'submit' and 'cancel' are visible by availableActions.
    // 'export' is a utility, always visible unless constrained.
    // 'submit' is primary, making it expectedNext.
    const projection = resolveScreenProjection(commands, 'DRAFT', ['submit', 'cancel'])

    expect(projection.commands.expectedNext?.key).toBe('submit')

    // Primary shouldn't include expectedNext
    expect(projection.commands.primary.map((c) => c.key)).toEqual(['cancel'])

    // Secondary includes non-toolbar commands
    expect(projection.commands.secondary.map((c) => c.key)).toEqual(['export'])
  })

  it('hides workflow commands not in availableActions', () => {
    const projection = resolveScreenProjection(commands, 'DRAFT', ['cancel'])

    expect(projection.commands.expectedNext).toBeUndefined()
    expect(projection.commands.primary.map((c) => c.key)).toEqual(['cancel'])
    expect(projection.commands.secondary.map((c) => c.key)).toEqual(['export'])
  })

  it('falls back to local domain state evaluation when availableActions is undefined', () => {
    // If availableActions is undefined, commands evaluate by their `from` state.
    // 'submit' has from: 'DRAFT', 'cancel' has from: 'DRAFT'.
    const projection = resolveScreenProjection(commands, 'DRAFT', undefined)

    expect(projection.commands.expectedNext?.key).toBe('submit')
    expect(projection.commands.primary.map((c) => c.key)).toEqual(['cancel'])
    expect(projection.commands.secondary.map((c) => c.key)).toEqual(['export'])
  })
})
