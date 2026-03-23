export interface PendingApprovalDTO {
  instance_id: string;
  entity_type: string;
  entity_id: string;
  current_state: string;
  target_state: string | null;
  required_role: string;
  submitted_at: string | null;
}

export interface ApprovalActionDTO {
  action: 'APPROVE' | 'REJECT';
  comments: string;
}

export interface WorkflowPolicyDTO {
  id: string;
  tenant_id: string;
  transition_id: string;
  condition_type: string;
  condition_value: string | null;
  is_active: boolean;
}
