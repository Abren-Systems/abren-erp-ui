import { createColumnHelper } from '@tanstack/vue-table'
import type { VendorDTO } from '@/modules/finance/ap/infrastructure/api.types'

const helper = createColumnHelper<VendorDTO>()

export const vendorListColumns = [
  helper.accessor('id', {
    header: 'Vendor ID',
    cell: (info) => info.getValue()?.split('-')[0]?.toUpperCase() ?? '',
  }),
  helper.accessor('name', {
    header: 'Vendor Name',
    cell: (info) => info.getValue(),
  }),
  helper.accessor('status', {
    header: 'Status',
    cell: (info) => info.getValue(),
  }),
  helper.accessor('tin', {
    header: 'TIN',
    cell: (info) => info.getValue() || '—',
  }),
  helper.accessor('trade_license_number', {
    header: 'Trade License #',
    cell: (info) => info.getValue() || '—',
  }),
]
