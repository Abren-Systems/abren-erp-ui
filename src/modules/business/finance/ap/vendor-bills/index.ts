import type { BusinessDomain } from '@/core/types/module.types'

export const vendorBillsModule: BusinessDomain = {
  id: 'vendor-bills',
  name: 'Vendor Bills',
  category: 'business',
  routes: () => import('./routes').then((m) => m.default),
  permissions: ['vendor_bills.view'],
  menuItems: [{ label: 'Vendor Bills', route: 'VendorBillsList', icon: 'file-text' }],
}
