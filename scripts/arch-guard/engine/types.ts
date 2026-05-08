import type { SourceFile } from 'ts-morph'

export type RuleSeverity = 'error' | 'warning'

export interface Violation {
  code: string
  message: string
  filePath: string
  line: number
  column: number
  severity: RuleSeverity
}

export interface RuleContext {
  report(
    violation: Omit<Violation, 'filePath' | 'line' | 'column'> & {
      node?: unknown
      line?: number
      column?: number
    },
  ): void
  sourceFile: SourceFile
  /**
   * If parsing a .vue file, this is the extracted <script setup> or <script> content.
   * Otherwise it's the raw content.
   */
  rawContent: string
  isVueFile: boolean
}

export interface Rule {
  code: string
  description: string
  severity: RuleSeverity
  /**
   * Evaluates the source file for violations.
   */
  check(context: RuleContext): void
}
