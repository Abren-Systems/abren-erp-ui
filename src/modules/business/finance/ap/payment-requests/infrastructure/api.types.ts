export interface PaymentRequestDTO {
  id: string;
  beneficiary_id: string;
  amount: number;
  currency: string;
  justification: string;
  status: string;
  bank_account_id: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  paid_at: string | null;
}

export interface PaymentRequestCreateDTO {
  beneficiary_id: string;
  amount: number;
  currency: string;
  justification: string;
  bank_account_id: string | null;
}

export interface PaymentRequestPayDTO {
  payment_method: string;
  reference: string;
}
