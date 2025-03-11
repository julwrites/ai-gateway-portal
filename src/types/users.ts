export type UserRole = 'proxy_admin' | 'proxy_admin_viewer' | 'internal_user' | 'internal_user_viewer' | 'team' | 'customer';

export interface User {
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

export interface UserResponse {
  users: User[];
  total_count?: number;
  current_page?: number;
  total_pages?: number;
}

export interface UserFormProps {
  onSubmit: (data: UserFormData) => Promise<void>;
  onClose: () => void;
  initialData?: UserFormData;
  isEdit?: boolean;
}
