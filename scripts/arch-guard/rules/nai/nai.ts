import type { Rule, RuleContext } from '../../engine/types'

export const NAI_RULES: Rule = {
  code: 'NAI',
  description: 'Enforces strict rules on the Navigation Runtime (State A)',
  severity: 'error',
  check(ctx: RuleContext) {
    if (!ctx.rawContent) return
    const filePath = ctx.sourceFile.getFilePath()

    // NAI-04: resolveWorkspaceModel must be synchronous
    if (filePath.includes('resolve-workspace-model')) {
      if (/async\s+function\s+resolveWorkspaceModel/.test(ctx.rawContent)) {
        ctx.report({
          code: 'NAI-04',
          message: 'resolveWorkspaceModel must be synchronous and deterministic. Do not use async.',
          severity: 'error',
        })
      }
    }

    // NAI-05: Workspace renderers must not access router state directly
    if (filePath.includes('workspace') && filePath.endsWith('Renderer.vue')) {
      if (ctx.rawContent.includes('useRoute()') || ctx.rawContent.includes('useRouter()')) {
        ctx.report({
          code: 'NAI-05',
          message:
            'Workspace renderers must not access router state directly. State enters through WorkspaceModel only.',
          severity: 'error',
        })
      }
    }
  },
}
