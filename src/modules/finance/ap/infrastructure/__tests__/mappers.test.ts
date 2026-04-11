import { describe, it, expect } from 'vitest'
import { APMapper } from '../mappers'
import type { PaymentRequestDTO, VendorBillDTO } from '../api.types'
import { Currency } from '../../../../../shared/domain/money'

describe('APMapper', () => {
  describe('toPaymentRequest', () => {
    it('should map PaymentRequestDTO to PaymentRequest', () => {
      const dto: PaymentRequestDTO = {
        id: 'pr-1',
        requester_id: 'user-1',
        beneficiary_id: 'ben-1',
        total_amount: '1500.00',
        currency: 'ETB',
        justification: 'Test justification',
        status: 'SUBMITTED',
        lines: [
          {
            id: 'line-1',
            description: 'Line 1',
            amount: '1500.00',
            account_id: 'acc-1',
            category_id: 'cat-1',
            tax_amount: '150.00',
          },
        ],
        bank_account_id: 'bank-1',
        target_liability_account_id: 'acc-2',
        submitted_at: '2026-04-01T10:00:00Z',
        paid_at: null,
        current_approval_step: 1,
        assigned_approver_id: 'approver-1',
        source_module: null,
        source_id: null,
      }

      const model = APMapper.toPaymentRequest(dto)

      expect(model.id).toBe('pr-1')
      expect(model.totalAmount.amount).toBe(1500)
      expect(model.totalAmount.currency).toBe(Currency.ETB)
      expect(model.lines).toHaveLength(1)
      expect(model.lines[0].taxAmount?.amount).toBe(150)
      expect(model.submittedAt).toEqual('2026-04-01')
    })
  })

  describe('toVendorBill', () => {
    it('should map VendorBillDTO to VendorBill', () => {
      const dto: VendorBillDTO = {
        id: 'bill-1',
        vendor_id: 'vendor-1',
        bill_number: 'INV-001',
        issue_date: '2026-04-01',
        due_date: '2026-04-15',
        currency: 'USD',
        justification: 'Hosting',
        status: 'VALIDATED',
        net_amount: '200.00',
        tax_total: '0.00',
        total_amount: '200.00',
        lines: [
          {
            id: 'line-1',
            description: 'Cloud Server',
            amount: '200.00',
            account_id: 'acc-1',
            category_id: 'cat-1',
            journal_line_id: null,
            tax_rule_id: null,
            tax_amount: '0.00',
          },
        ],
      }

      const model = APMapper.toVendorBill(dto)

      expect(model.id).toBe('bill-1')
      expect(model.billNumber).toBe('INV-001')
      expect(model.totalAmount.amount).toBe(200)
      expect(model.totalAmount.currency).toBe(Currency.USD)
      expect(model.issueDate).toEqual('2026-04-01')
    })
  })
})
