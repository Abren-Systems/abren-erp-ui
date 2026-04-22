<script setup lang="ts">
import { ref } from 'vue'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/shared/components/drawer'
import { Button } from '@/shared/components/button'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select'
import { useCreateTaxRule } from '../../../application/useCreateTaxRule'
import type { TaxRuleCreateDTO } from '../../../infrastructure/api.types'

/**
 * Drawer: Create Tax Rule.
 *
 * Orchestrates the tax rule creation form.
 */
const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { mutateAsync: createRule, isPending } = useCreateTaxRule()

const form = ref<TaxRuleCreateDTO>({
  name: '',
  rate: 0,
  tax_type: 'VAT',
  gl_account_id: '',
})

async function handleSubmit() {
  try {
    await createRule(form.value)
    emit('update:open', false)
    // Reset form
    form.value = {
      name: '',
      rate: 0,
      tax_type: 'VAT',
      gl_account_id: '',
    }
  } catch (error) {
    console.error('Failed to create tax rule:', error)
  }
}
</script>

<template>
  <Drawer :open="props.open" @update:open="emit('update:open', $event)">
    <DrawerContent class="sm:max-w-[425px]">
      <DrawerHeader>
        <DrawerTitle>New Tax Rule</DrawerTitle>
        <DrawerDescription> Configure a new tax rate for the system. </DrawerDescription>
      </DrawerHeader>

      <div class="grid gap-4 py-4 px-4">
        <div class="grid gap-2">
          <Label for="name">Name</Label>
          <Input id="name" v-model="form.name" placeholder="e.g. Standard VAT 15%" />
        </div>

        <div class="grid gap-2">
          <Label for="tax_type">Tax Type</Label>
          <Select v-model="form.tax_type">
            <SelectTrigger id="tax_type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VAT">VAT (Value Added Tax)</SelectItem>
              <SelectItem value="WHT">WHT (Withholding Tax)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="grid gap-2">
          <Label for="rate">Rate (Decimal)</Label>
          <Input
            id="rate"
            v-model.number="form.rate"
            type="number"
            step="0.01"
            placeholder="0.15"
          />
          <p class="text-xs text-muted-foreground">Enter 0.15 for 15%</p>
        </div>

        <div class="grid gap-2">
          <Label for="gl_account_id">GL Account ID (UUID)</Label>
          <Input
            id="gl_account_id"
            v-model="form.gl_account_id"
            placeholder="00000000-0000-0000-0000-000000000000"
          />
        </div>
      </div>

      <DrawerFooter>
        <Button variant="outline" @click="emit('update:open', false)">Cancel</Button>
        <Button :loading="isPending" @click="handleSubmit">Create Rule</Button>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
