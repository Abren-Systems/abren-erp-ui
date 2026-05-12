import type { WorkspaceDefinition, WorkspaceId } from './workspace-definition'
import { reactive } from 'vue'

class WorkspaceRegistry {
  private registry = reactive<Map<WorkspaceId, WorkspaceDefinition>>(new Map())

  register(definition: WorkspaceDefinition) {
    if (this.registry.has(definition.id)) {
      console.warn(`[WorkspaceRegistry] Overwriting workspace: ${definition.id}`)
    }
    this.registry.set(definition.id, definition)
  }

  get(id: WorkspaceId): WorkspaceDefinition | undefined {
    return this.registry.get(id)
  }

  getByCategory(category: 'business' | 'platform'): WorkspaceDefinition[] {
    return Array.from(this.registry.values()).filter((w) => w.category === category)
  }

  getAll(): WorkspaceDefinition[] {
    return Array.from(this.registry.values())
  }
}

export const workspaceRegistry = new WorkspaceRegistry()
