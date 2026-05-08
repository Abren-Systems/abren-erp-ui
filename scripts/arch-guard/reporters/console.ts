import type { Violation } from '../engine/types'
import * as path from 'path'

export function reportViolations(violations: Violation[], basePath: string): boolean {
  if (violations.length === 0) {
    console.log('\n\x1b[32m%s\x1b[0m', '✔ All architectural invariants passed.')
    return true
  }

  const errors = violations.filter((v) => v.severity === 'error')
  const warnings = violations.filter((v) => v.severity === 'warning')

  console.log(
    '\n\x1b[31m%s\x1b[0m',
    `Found ${errors.length} errors and ${warnings.length} warnings:`,
  )

  // Group by file
  const grouped = violations.reduce(
    (acc, v) => {
      const relPath = path.relative(basePath, v.filePath)
      if (!acc[relPath]) acc[relPath] = []
      acc[relPath].push(v)
      return acc
    },
    {} as Record<string, Violation[]>,
  )

  for (const [file, fileViolations] of Object.entries(grouped)) {
    console.log(`\n\x1b[4m${file}\x1b[0m`)
    for (const v of fileViolations) {
      const color = v.severity === 'error' ? '\x1b[31m' : '\x1b[33m'
      console.log(
        `  ${color}${v.line}:${v.column}\x1b[0m  ${color}error\x1b[0m  [${v.code}] ${v.message}`,
      )
    }
  }

  console.log('\n')
  return errors.length === 0
}
