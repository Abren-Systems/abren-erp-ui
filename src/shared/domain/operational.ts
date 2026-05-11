/**
 * FieldPermission: Authoritative permission levels for UI fields.
 * Owned by Backend Authority, consumed by Platform Runtime.
 */
export enum FieldPermission {
  EDITABLE = 'editable',
  READONLY = 'readonly',
  HIDDEN = 'hidden',
}

/**
 * OperationalMetadata: The core contract for workflow-enabled entities.
 * Every response for a versioned business aggregate must include this.
 */
export interface OperationalMetadata {
  /**
   * List of command keys available to the current user in the current state.
   * Overrides static 'from[]' in commands.ts.
   */
  availableActions: string[]

  /**
   * Field-level editability overrides.
   * If a field is not present, it defaults to EDITABLE (if metadata is present).
   */
  fieldPermissions: Record<string, FieldPermission>

  /**
   * The 'primary' action to highlight in the UI (e.g., the Green Button).
   */
  expectedNext?: string | null

  /**
   * Optimistic Concurrency Control version.
   * Must be sent back in 'If-Match' header for mutations.
   */
  version: number
}
