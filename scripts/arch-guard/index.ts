import { Scanner } from './engine/scanner'
import { reportViolations } from './reporters/console'
import * as path from 'path'

import { DRI01 } from './rules/dri/dri-01'
import { DRI03 } from './rules/dri/dri-03'
import { DRI04 } from './rules/dri/dri-04'
import { DRI05 } from './rules/dri/dri-05'
import { EOI01 } from './rules/eoi/eoi-01'
import { EOI_RULES } from './rules/eoi/eoi'
import { RII01 } from './rules/rii/rii-01'
import { RII_RULES } from './rules/rii/rii'
import { ABI01 } from './rules/abi/abi-01'
import { ABI02 } from './rules/abi/abi-02'
import { ABI_RULES } from './rules/abi/abi'
import { DPI01_03 } from './rules/dpi/dpi'
import { DAI_RULES } from './rules/dai/dai'
import { SNI_RULES } from './rules/sni/sni'
import { NAI_RULES } from './rules/nai/nai'
import { SMI_RULES } from './rules/smi/smi'

async function main() {
  const basePath = path.resolve(process.cwd())
  const scanner = new Scanner(basePath)

  // Register rules
  scanner.registerRule(DRI01)
  scanner.registerRule(DRI03)
  scanner.registerRule(DRI04)
  scanner.registerRule(DRI05)
  scanner.registerRule(EOI01)
  scanner.registerRule(EOI_RULES)
  scanner.registerRule(RII01)
  scanner.registerRule(RII_RULES)
  scanner.registerRule(ABI01)
  scanner.registerRule(ABI02)
  scanner.registerRule(ABI_RULES)
  scanner.registerRule(DPI01_03)
  scanner.registerRule(DAI_RULES)
  scanner.registerRule(SNI_RULES)
  scanner.registerRule(NAI_RULES)
  scanner.registerRule(SMI_RULES)

  console.log('Running Arch-Guard Constitution Validator...')
  const violations = scanner.scan('src')

  const success = reportViolations(violations, basePath)

  if (!success) {
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Arch-Guard execution failed:', err)
  process.exit(1)
})
