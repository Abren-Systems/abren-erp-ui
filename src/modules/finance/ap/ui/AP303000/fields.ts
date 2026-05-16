import type { FieldDefinition } from '@/platform/field-system/field-definition.types'
import type { VendorDTO } from '@/modules/finance/ap/infrastructure/api.types'

export const AP303000_FIELDS = {
  name: {
    key: 'name',
    label: 'Vendor Name',
    type: 'text',
  } as FieldDefinition<VendorDTO, string>,
  status: {
    key: 'status',
    label: 'Status',
    type: 'status',
  } as FieldDefinition<VendorDTO, string>,
  tin: {
    key: 'tin',
    label: 'TIN',
    type: 'text',
  } as FieldDefinition<VendorDTO, string | null>,
  trade_license_number: {
    key: 'trade_license_number',
    label: 'Trade License #',
    type: 'text',
  } as FieldDefinition<VendorDTO, string | null>,
  has_tin_certificate: {
    key: 'has_tin_certificate',
    label: 'Has TIN Certificate',
    type: 'checkbox',
  } as FieldDefinition<VendorDTO, boolean>,
  has_valid_trade_license: {
    key: 'has_valid_trade_license',
    label: 'Has Valid Trade License',
    type: 'checkbox',
  } as FieldDefinition<VendorDTO, boolean>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} satisfies Record<string, FieldDefinition<VendorDTO, any>>
