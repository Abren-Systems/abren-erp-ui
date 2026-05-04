// ── Screen View Types ─────────────────────────────────────
// Maps to Acumatica's createSingle, createCollection, and viewInfo.
// A ScreenView describes a typed data source within a screen —
// the frontend equivalent of a server-side graph data view.

/**
 * The kind of data a view provides.
 * - 'single': One record (e.g., payment request header)
 * - 'collection': A list of records (e.g., line items grid)
 * - 'selection': A filterable selection set for processing screens
 * - 'report': A parameterized report result set
 */
export type ScreenViewKind = 'single' | 'collection' | 'selection' | 'report'

/**
 * A typed view descriptor within a screen.
 * Views decouple data access from layout — the screen definition declares
 * what data exists; the renderer decides where to place it.
 */
export interface ScreenView {
  /** View name, used as the key in ScreenViews and for test targeting */
  readonly name: string

  /** The shape of data this view provides */
  readonly kind: ScreenViewKind

  /**
   * Stable container name for testing and customization.
   * Maps to Acumatica's viewInfo({ containerName }).
   */
  readonly containerName: string

  /**
   * TanStack Query key factory for this view's data source.
   * The screen controller uses this to manage fetching and caching.
   */
  readonly queryKey: readonly unknown[]
}

/**
 * A record of named views that a screen declares.
 * The ScreenDefinition's `primaryView` must be a key of this record.
 */
export type ScreenViews = Record<string, ScreenView>
