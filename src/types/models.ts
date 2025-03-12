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
}

export interface ModelResponse {
  models: Model[];
  total_count?: number;
  current_page?: number;
  total_pages?: number;
}