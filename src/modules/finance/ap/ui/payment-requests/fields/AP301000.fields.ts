/**
 * Field metadata and control definitions for Payment Requests.
 *
 * This file serves as the metadata registry for dropdown options,
 * filter presets, and control configurations used by the screen runtime.
 */

import type { FieldOptionContract } from '@/platform/component-contracts'

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
