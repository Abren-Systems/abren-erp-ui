/**
 * Field metadata and control definitions for Payment Requests.
 *
 * This file serves as the metadata registry for dropdown options,
 * filter presets, and control configurations used by the screen runtime.
 */

import type { FieldOptionContract } from '@/platform/component-contracts'
import type { FieldDefinition } from '@/platform/field-system/field-definition.types'
import type { PaymentRequest } from '../../../domain/ap.types'

export const PAYMENT_REQUEST_STATUS_OPTIONS: readonly FieldOptionContract[] = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Authorized', value: 'AUTHORIZED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

export const PAYMENT_REQUEST_FILTER_PRESETS = [
  { id: 'all', label: 'All Records' },
  { id: 'needs_attention', label: 'Needs Attention' },
  { id: 'in_review', label: 'In Review' },
]

export const CURRENCY_OPTIONS: readonly FieldOptionContract[] = [
  { label: 'ETB', value: 'ETB' },
  { label: 'USD', value: 'USD' },
]

// ── Strict Field Definitions ─────────────────────────────
// Encapsulates all presentation and state-based rules.
// The controller owns this logic, and the View simply binds to it.

export const AP301000_FIELDS = {
  requesterId: {
    key: 'requesterId',
    label: 'Requester',
    type: 'text', // using text as a fallback since type: 'id' might not be in FieldRenderType, but let's use 'text' or add 'selector'
    readonly: () => true, // System generated
  } as FieldDefinition<PaymentRequest, string>,

  beneficiaryId: {
    key: 'beneficiaryId',
    label: 'Beneficiary',
    type: 'selector',
    readonly: (state) => !state.isEditable,
    required: () => true,
  } as FieldDefinition<PaymentRequest, string>,

  status: {
    key: 'status',
    label: 'Status',
    type: 'text',
    readonly: () => true,
  } as FieldDefinition<PaymentRequest, string>,

  submittedAt: {
    key: 'submittedAt',
    label: 'Submitted On',
    type: 'date',
    readonly: () => true,
  } as FieldDefinition<PaymentRequest, string>,

  justification: {
    key: 'justification',
    label: 'Justification',
    type: 'textarea',
    readonly: (state) => !state.isEditable,
  } as FieldDefinition<PaymentRequest, string>,

  currency: {
    key: 'currency',
    label: 'Currency',
    type: 'selector',
    readonly: (state) => !state.isEditable,
  } as FieldDefinition<PaymentRequest, string>,

  totalAmount: {
    key: 'totalAmount',
    label: 'Order Total',
    type: 'amount',
    readonly: () => true, // Calculated from lines
  } as FieldDefinition<PaymentRequest, number>,
} as const
