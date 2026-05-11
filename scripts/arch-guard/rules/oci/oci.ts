import { OCI01 } from './oci-01'
import type { RuleContext } from '../../engine/types'

export const OCI_RULES = {
  code: 'OCI',
  description: 'Operational Contract Integrity',
  severity: 'error' as const,
  check(context: RuleContext) {
    OCI01.check(context)
  },
}
