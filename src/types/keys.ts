export interface APIKey {
  key: string;
  key_name?: string;
  key_alias?: string;
  spend: number;
  max_budget?: number;
  expires?: string;
  models: any[];
  aliases: Record<string, any>;
  config: Record<string, any>;
  user_id?: string;
  team_id?: string;
  max_parallel_requests?: number;
  metadata: Record<string, any>;
  tpm_limit?: number;
  rpm_limit?: number;
  budget_duration?: string;
  budget_reset_at?: string;
  permissions: Record<string, any>;
  model_spend: Record<string, any>;
  model_max_budget: Record<string, any>;
  blocked?: boolean;
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
