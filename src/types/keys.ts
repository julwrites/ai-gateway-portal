export interface APIKey {
  id: string;
  key: string;
  key_alias?: string;
  spend: number;
  max_budget?: number;
  expires?: string;
  models: string[];
  aliases: Record<string, any>;
  user_id?: string;
  team_id?: string;
  permissions: Record<string, any>;
  max_parallel_requests?: number;
  tpm_limit?: number;
  rpm_limit?: number;
  budget_duration?: string;
  created_at?: string;
  updated_at?: string;
}

export interface APIKeyFormData {
  key_alias?: string;
  duration?: string;
  models?: string[];
  max_budget?: number;
  user_id?: string;
  team_id?: string;
  max_parallel_requests?: number;
  metadata?: Record<string, any>;
  tpm_limit?: number;
  rpm_limit?: number;
  budget_duration?: string;
  permissions?: Record<string, any>;
  model_max_budget?: Record<string, any>;
  blocked?: boolean;
}

export interface APIKeyResponse {
  keys: APIKey[];
  total_count?: number;
  current_page?: number;
  total_pages?: number;
}

export interface KeyFormProps {
  onSubmit: (data: APIKeyFormData) => Promise<void>;
  onClose: () => void;
  initialData?: APIKeyFormData;
  isEdit?: boolean;
