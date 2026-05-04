<script setup lang="ts">
import { inject, type Ref } from 'vue'
import { AppFieldset, AppField } from '@/shared/components/field-system'
import PaymentRequestTimeline from '../timeline.vue'
import type { PaymentRequest } from '../../../../domain/ap.types'
import { ScreenControllerInstance } from '@/platform/screen-runtime'

/**
 * Trace Panel Content
 *
 * Rendered by the platform AppSidePanel container.
 * It receives the screen controller via inject to access the current entity.
 */

// The platform injects the controller into the side panel content
const ctrl = inject<ScreenControllerInstance<PaymentRequest>>('screenController')
</script>

<template>
  <div v-if="ctrl?.entity.value" class="space-y-8 p-4">
    <!-- Shared Timeline -->
    <PaymentRequestTimeline :request="ctrl.entity.value" />

    <!-- GL Journal Impact -->
    <AppFieldset
      v-if="ctrl.entity.value.targetLiabilityAccountId"
      title="Financial Impact (GL)"
      layout="vertical"
      :columns="1"
    >
      <AppField
        field="liability"
        label="Liability Account"
        :value="ctrl.entity.value.targetLiabilityAccountId"
        type="id"
      />
      <AppField
        field="disbursement"
        label="Disbursement Account"
        :value="ctrl.entity.value.bankAccountId"
        type="id"
      />
    </AppFieldset>

    <!-- Source Document -->
    <AppFieldset
      v-if="ctrl.entity.value.sourceModule"
      title="Source Document"
      layout="vertical"
      :columns="1"
    >
      <AppField
        field="module"
        label="Originating Module"
        :value="ctrl.entity.value.sourceModule"
        type="text"
      />
      <AppField
        field="reference"
        label="Internal Reference"
        :value="ctrl.entity.value.sourceId"
        type="id"
      />
    </AppFieldset>
  </div>
  <div v-else class="p-4 text-sm text-neutral-500">No record selected.</div>
</template>
