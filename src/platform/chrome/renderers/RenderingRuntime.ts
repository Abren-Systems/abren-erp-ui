import type { Component } from 'vue'

/**
 * Rendering Runtime
 *
 * Provides the explicit mapping from framework-agnostic `rendererKey`s
 * to actual Vue Component definitions. This is instantiated at the root
 * of the application to preserve runtime isolation.
 */

export interface RenderingRuntimeOptions {
  rendererMappings: Record<string, () => Promise<{ default: Component }>>
}

class RenderingRuntimeImpl {
  private mappings: Record<string, () => Promise<{ default: Component }>> = {}
  private resolvedCache = new Map<string, Component>()

  configure(options: RenderingRuntimeOptions) {
    this.mappings = options.rendererMappings
  }

  async resolveRenderer(key: string): Promise<Component> {
    if (this.resolvedCache.has(key)) {
      return this.resolvedCache.get(key)!
    }

    const loader = this.mappings[key]
    if (!loader) {
      throw new Error(`[RenderingRuntime] Unknown rendererKey: ${key}`)
    }

    const module = await loader()
    const component = module.default
    this.resolvedCache.set(key, component)
    return component
  }

  /**
   * For synchronous resolution (e.g. defineAsyncComponent fallback).
   * Note: In Vue, it's often easier to return the loader directly and wrap it
   * with defineAsyncComponent at the boundary.
   */
  getLoader(key: string): (() => Promise<{ default: Component }>) | undefined {
    return this.mappings[key]
  }
}

export const renderingRuntime = new RenderingRuntimeImpl()
