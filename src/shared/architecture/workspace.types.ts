/**
 * Represents a unique open instance (tab) of a specific Screen.
 * Two instances of the same ScreenId can exist simultaneously
 * (e.g., editing Bill A and viewing Bill B).
 */
export interface ScreenInstance<TContext = unknown> {
  /**
   * A globally unique UUID for this specific open tab/instance.
   * This is used as the key in the Workspace instances Map.
   */
  readonly instanceId: string

  /**
   * The identifier of the registered ScreenDefinition (e.g., 'AP301000').
   */
  readonly screenId: string

  /**
   * The context data used to initialize the screen.
   * For existing records, this typically contains `{ id: '123' }`.
   * For new records, this might be empty `{}` or contain defaults.
   */
  readonly context: TContext
}

/**
 * The top-level orchestrator that replaces standard SPA routing.
 * The Workspace manages multiple open ScreenInstances and tracks which one is active.
 */
export interface Workspace {
  /**
   * The registry of all currently open screen instances.
   */
  readonly instances: Map<string, ScreenInstance>

  /**
   * The `instanceId` of the currently visible screen.
   */
  readonly activeInstanceId: string | null

  /**
   * Requests the Workspace to open a screen.
   * If an instance with the identical screenId and context already exists,
   * it should switch focus to that instance rather than duplicating it.
   */
  openScreen(screenId: string, context?: unknown): void

  /**
   * Closes an active screen instance.
   * This should trigger the Controller's lifecycle destroy methods and
   * release memory.
   */
  closeScreen(instanceId: string): void

  /**
   * Switches the active viewport to an already open screen instance.
   */
  focusScreen(instanceId: string): void
}
