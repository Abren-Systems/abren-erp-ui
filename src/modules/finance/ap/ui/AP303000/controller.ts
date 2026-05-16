import { computed } from 'vue'
import { useScreenController } from '@/platform/screen-runtime'
import { useField } from '@/platform/field-system/bindings/useField'
import { AP303000 } from './screen'
import { AP303000_POLICY } from './policy'
import { AP303000_FIELDS } from './fields'
import { useVendor } from '../../application/useVendor'
import { useCreateVendor } from '../../application/useCreateVendor'
import type { VendorDTO } from '@/modules/finance/ap/infrastructure/api.types'
import { useFormPersistence } from '@/shared/composables/useFormPersistence'

export function useVendorProfileController(id: string) {
  const isNew = computed(() => id === 'new')

  // Load existing vendor (if not new)
  const { vendor, isLoading } = useVendor(isNew.value ? null : id)

  // Form for creating vendor
  const { form, isSubmitting: isCreating } = useCreateVendor()
  useFormPersistence(form, 'abren_draft_vendor')

  // If we are editing an existing record, we mock the model
  const activeEntity = computed(() => {
    if (isNew.value) {
      return {
        ...(form.state.values as unknown as VendorDTO),
        id: 'new',
        status: 'ACTIVE',
      } as VendorDTO
    }
    return vendor.value
  })

  const base = useScreenController<VendorDTO, string>({
    screen: AP303000,
    dataSource: { entity: activeEntity, isLoading, error: computed(() => null) },
    isNew,
    getDomainState: (entity) => entity?.status ?? 'DRAFT',
    statePolicy: AP303000_POLICY,
  })

  // Attach form to base so useField can bind models
  Object.assign(base, { form })

  base.registerCommand('save', {
    execute: async () => {
      void form.handleSubmit()
    },
    isPending: isCreating,
  })

  const fields = {
    name: useField(base, AP303000_FIELDS.name),
    status: useField(base, AP303000_FIELDS.status),
    tin: useField(base, AP303000_FIELDS.tin),
    trade_license_number: useField(base, AP303000_FIELDS.trade_license_number),
    has_tin_certificate: useField(base, AP303000_FIELDS.has_tin_certificate),
    has_valid_trade_license: useField(base, AP303000_FIELDS.has_valid_trade_license),
  }

  return {
    ...base,
    fields,
  }
}
