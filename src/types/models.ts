export type ModelProvider = 'openai' | 'anthropic' | 'azure' | 'cohere' | 'google' | 'mistral';

export interface Model {
  model_id: string;
  provider: ModelProvider;
  display_name?: string;
  description?: string;
  is_active?: boolean;
  max_tokens?: number;
  cost_per_token?: number;
  input_cost_per_token?: number;
  output_cost_per_token?: number;
  api_base?: string;
  api_key?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ModelFormData {
  model_id?: string;
  provider?: ModelProvider;
  display_name?: string;
  description?: string;
  is_active?: boolean;
  max_tokens?: number;
  cost_per_token?: number;
  input_cost_per_token?: number;
  output_cost_per_token?: number;
  api_base?: string;
  api_key?: string;
  models: string[];
}


export interface ModelResponse {
  models: Model[];
  total_count?: number;
  current_page?: number;
  total_pages?: number;
}

export interface ModelFormProps {
  onSubmit: (data: ModelFormData) => Promise<void>;
  onClose: () => void;
  initialData?: ModelFormData;
  isEdit?: boolean;
}
