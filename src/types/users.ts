
export type UserRole = 'proxy_admin' | 'proxy_admin_viewer' | 'internal_user' | 'internal_user_viewer';

export interface UserRequest {
  user_id?: string;
  user_email?: string;
  user_role?: UserRole;
  teams?: string[];
  max_budget?: number;
  budget_duration?: string;
  models?: string[];
  tpm_limit?: number;
  rpm_limit?: number;
  budget_id?: string;
  allowed_cache_controls?: string[];
  blocked?: boolean;
  metadata?: Record<string, any>;
  max_parallel_requests?: number;
  soft_budget?: number;
  model_max_budget?: Record<string, BudgetConfig>;
  model_rpm_limit?: Record<string, number>;
  model_tpm_limit?: Record<string, number>;
  user_alias?: string;
  auto_create_key?: boolean;
  send_invite_email?: boolean;
}

export interface UserResponse {
  user_id: string;
  user_email?: string;
  user_role?: UserRole;
  teams?: string[];
  max_budget?: number;
  spend?: number;
  model_max_budget?: Record<string, any>;
  model_spend?: Record<string, any>;
  models?: string[];
  tpm_limit?: number;
  rpm_limit?: number;
  budget_duration?: string;
  budget_reset_at?: string;
  created_at?: string;
  updated_at?: string;
  key?: string;
  expires?: string;
  budget_id?: string;
  allowed_cache_controls?: string[];
  blocked?: boolean;
  metadata?: Record<string, any>;
  max_parallel_requests?: number;
  soft_budget?: number;
  model_rpm_limit?: Record<string, number>;
  model_tpm_limit?: Record<string, number>;
  user_alias?: string;
}

export interface UserListResponse {
  users: UserResponse[];
  total_count?: number;
  current_page?: number;
  total_pages?: number;
}

export interface UserFormData {
  user_id?: string;
  user_email?: string;
  user_role?: UserRole;
  teams?: string[];
  max_budget?: number;
  models?: string[];
  tpm_limit?: number;
  rpm_limit?: number;
  budget_duration?: string;
}

export interface UserFormProps {
  onSubmit: (data: UserRequest) => Promise<void>;
  onClose: () => void;
  initialData?: UserRequest;
  isEdit?: boolean;
}

export interface BudgetConfig {
  max_budget?: number;
  budget_duration?: string;
  tpm_limit?: number;
  rpm_limit?: number;
}