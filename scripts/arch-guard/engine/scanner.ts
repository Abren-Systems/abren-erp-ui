/// <reference types="node" />
import { Project } from 'ts-morph'
import * as fs from 'fs'
import * as path from 'path'
import { parse } from '@vue/compiler-sfc'
import type { Rule, Violation, RuleContext } from './types'

export class Scanner {
  private rules: Rule[] = []
  private project: Project
  private basePath: string

  constructor(basePath: string) {
    this.basePath = path.resolve(basePath)
    this.project = new Project({
      tsConfigFilePath: path.join(this.basePath, 'tsconfig.app.json'),
      skipAddingFilesFromTsConfig: true,
    })
  }

  registerRule(rule: Rule) {
    this.rules.push(rule)
  }

  /**
   * Recursively find all .ts and .vue files
   */
  private findFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir)
    for (const file of files) {
      const fullPath = path.join(dir, file)
      if (fs.statSync(fullPath).isDirectory()) {
        this.findFiles(fullPath, fileList)
      } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.vue')) {
        fileList.push(fullPath)
      }
    }
    return fileList
  }

  scan(targetDir: string = 'src'): Violation[] {
    const allViolations: Violation[] = []
    const fullTargetDir = path.join(this.basePath, targetDir)
    const files = this.findFiles(fullTargetDir)

    for (const filePath of files) {
      const isVueFile = filePath.endsWith('.vue')
      const rawContent = fs.readFileSync(filePath, 'utf-8')
      let tsContent = rawContent
      let scriptOffsetLines = 0

      if (isVueFile) {
        try {
          const { descriptor } = parse(rawContent, { filename: filePath })
          const scriptBlock = descriptor.scriptSetup || descriptor.script

          if (scriptBlock) {
            tsContent = scriptBlock.content
            // Calculate the offset so line numbers in errors match the original .vue file
            const contentBeforeScript = rawContent.slice(0, scriptBlock.loc.start.offset)
            scriptOffsetLines = (contentBeforeScript.match(/\n/g) || []).length
          } else {
            // No script block, skip TS analysis
            tsContent = ''
          }
        } catch {
          console.warn(`[ArchGuard] Warning: Failed to parse Vue file ${filePath}. Skipping.`)
          continue
        }
      }

      // We add the file to the ts-morph project
      // Create a virtual file to avoid conflicting with actual file system if needed,
      // but creating it with the actual path makes module resolution better.
      let sourceFile
      try {
        sourceFile = this.project.createSourceFile(filePath + (isVueFile ? '.ts' : ''), tsContent, {
          overwrite: true,
        })
      } catch {
        console.warn(`[ArchGuard] Warning: ts-morph failed to parse ${filePath}. Skipping.`)
        continue
      }

      for (const rule of this.rules) {
        const context: RuleContext = {
          sourceFile,
          rawContent,
          isVueFile,
          report: (violationParams) => {
            let line = 1
            let column = 1

            if ('node' in violationParams && violationParams.node) {
              const node = violationParams.node as unknown as {
                getStartLineNumber: () => number
                getStartLinePos: () => number
              }
              line = node.getStartLineNumber()
              column = node.getStartLinePos()
            }

            allViolations.push({
              code: violationParams.code,
              message: violationParams.message,
              filePath,
              line: line + scriptOffsetLines,
              column,
              severity: violationParams.severity,
            })
          },
        }

        try {
          rule.check(context)
        } catch (e) {
          console.error(`Error running rule ${rule.code} on ${filePath}:`, e)
        }
      }

      // Clean up to save memory
      this.project.removeSourceFile(sourceFile)
    }

    return allViolations
  }
}
