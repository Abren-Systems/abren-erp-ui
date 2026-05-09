import type { Rule, RuleContext } from '../../engine/types'

export const SMI_RULES: Rule = {
  code: 'SMI',
  description: 'Enforces strict rules on the Canonical Semantic Runtime',
  severity: 'error',
  check(ctx: RuleContext) {
    if (!ctx.rawContent) return
    const filePath = ctx.sourceFile.getFilePath()

    // SMI-04: Semantic contracts must remain serializable and stateless.
    if (
      filePath.includes('semantic-runtime/contracts') ||
      filePath.includes('semantic-runtime/registry')
    ) {
      if (
        ctx.rawContent.includes('ref(') ||
        ctx.rawContent.includes('reactive(') ||
        ctx.rawContent.includes('computed(')
      ) {
        ctx.report({
          code: 'SMI-04',
          message:
            'Semantic contracts and registries must remain serializable and stateless. Do not use Vue reactivity.',
          severity: 'error',
        })
      }
    }

    // SMI-03: Views must not manually format semantic values.
    if (filePath.endsWith('.vue')) {
      if (ctx.rawContent.includes('.toFixed(')) {
        ctx.report({
          code: 'SMI-03',
          message:
            'Views must not manually format semantic values. Do not use .toFixed(). Rely on the Semantic Runtime.',
          severity: 'error',
        })
      }
    }
  },
}
