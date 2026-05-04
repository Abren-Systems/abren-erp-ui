import type { ScreenDefinition } from './screen-definition.types'
import type { ScreenId } from './screen-id.types'

/**
 * ScreenRegistry
 *
 * A global, immutable registry of all ScreenDefinitions collected from modules.
 * This is the single source of truth for what screens exist in the system.
 *
 * The registry is built once at app startup from module exports and is
 * consumed by the router, navigation, search, and permission systems.
 */
export class ScreenRegistry {
  private readonly screens = new Map<string, ScreenDefinition>()

  /** Register a single screen definition */
  register(screen: ScreenDefinition): void {
    const id = screen.id as string
    if (this.screens.has(id)) {
      throw new Error(
        `[ScreenRegistry] Duplicate screen ID: "${id}". ` +
          `Each screen must have a unique identifier.`,
      )
    }
    this.screens.set(id, screen)
  }

  /** Register all screens from a module */
  registerAll(screens: readonly ScreenDefinition[]): void {
    for (const screen of screens) {
      this.register(screen)
    }
  }

  /** Look up a screen by its ID */
  get(id: ScreenId): ScreenDefinition | undefined {
    return this.screens.get(id as string)
  }

  /** Get all registered screens */
  getAll(): readonly ScreenDefinition[] {
    return [...this.screens.values()]
  }

  /** Get all screens for a specific module */
  getByModule(moduleId: string): readonly ScreenDefinition[] {
    return [...this.screens.values()].filter((s) => (s.moduleId as string) === moduleId)
  }

  /** Check if a screen ID is registered */
  has(id: ScreenId): boolean {
    return this.screens.has(id as string)
  }

  /** Total number of registered screens */
  get size(): number {
    return this.screens.size
  }
}

/**
 * The singleton registry instance.
 * Populated at app startup before the router is created.
 */
export const screenRegistry = new ScreenRegistry()
