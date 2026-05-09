import type { ScreenDefinition, ScreenController } from '@/platform/screen-runtime'
import { createScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { ModuleId } from '@/shared/types/brand.types'
import { useARInvoiceController } from './controller'

export const AR301000: ScreenDefinition = {
  id: createScreenId('AR301000'),
  moduleId: 'ar' as ModuleId,
  kind: 'dataEntry',
  titleKey: 'Invoices and Memos',
  primaryView: 'invoice',
  controller: (ctx) =>
    useARInvoiceController(ctx.params['id'] as string) as unknown as ScreenController<
      unknown,
      string
    >,
  route: {
    path: 'invoice/:id?',
    name: 'ARInvoice',
  },
  permissions: [{ key: 'ar:view' }],
  views: {
    invoice: {
      name: 'invoice',
      kind: 'single',
      containerName: 'InvoiceRecord',
      queryKey: ['ar', 'invoice'] as const,
    },
  },
  layout: {
    summaryTemplate: '1-1',
    renderTarget: () => import('./view.vue') as never,
  },
  personalization: {
    allowTabPersonalization: true,
    allowGridPersonalization: true,
    allowFilterSaving: true,
    allowSectionPersonalization: true,
  },
  test: {
    containerName: 'AR301000',
    viewNames: [],
    actionNames: [],
  },
  commands: [
    {
      key: 'release',
      labelKey: 'Release',
      variant: 'primary',
      displayOnMainToolbar: true,
      from: ['Balanced'],
      to: 'Released',
    },
    {
      key: 'reverse',
      labelKey: 'Reverse',
      variant: 'neutral',
      displayOnMainToolbar: false,
      from: ['Released'],
    },
    {
      key: 'void',
      labelKey: 'Void',
      variant: 'danger',
      displayOnMainToolbar: false,
      from: ['Open', 'Balanced'],
    },
  ],
}
