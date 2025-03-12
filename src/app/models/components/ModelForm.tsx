import { useState, useEffect } from 'react';
import { ModelFormData, ModelFormProps, ModelProvider } from '@/types/models';

export function ModelForm({ onSubmit, onClose, initialData, isEdit = false }: ModelFormProps) {
  const [formData, setFormData] = useState<ModelFormData>(initialData || {
    model_id: '',
    provider: undefined,
    display_name: '',
    description: '',
    is_active: true,
    max_tokens: undefined,
    cost_per_token: undefined,
    input_cost_per_token: undefined,
    output_cost_per_token: undefined,
    api_base: '',
    api_key: '',
    models: [],
  });

  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    if (formData.provider) {
      // Fetch available models for the selected provider
      fetchAvailableModels(formData.provider);
    }
  }, [formData.provider]);

  const fetchAvailableModels = async (provider: ModelProvider) => {
    // This is a placeholder. You'll need to implement an API endpoint to fetch models for a provider
    const response = await fetch(`/api/models/available?provider=${provider}`);
    const data = await response.json();
    setAvailableModels(data.models);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="model_id" className="block text-sm font-medium text-gray-700">
          Model ID
        </label>
        <input
          type="text"
          id="model_id"
          value={formData.model_id || ''}
          onChange={(e) => setFormData({ ...formData, model_id: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="gpt-4"
        />
      </div>

      <div>
        <label htmlFor="provider" className="block text-sm font-medium text-gray-700">
          Provider
        </label>
        <select
          id="provider"
          value={formData.provider || ''}
          onChange={(e) => setFormData({ ...formData, provider: e.target.value as ModelProvider })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Select provider</option>
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="azure">Azure</option>
          <option value="cohere">Cohere</option>
          <option value="google">Google</option>
          <option value="mistral">Mistral</option>
        </select>
      </div>

      {formData.provider && (
        <div>
          <label htmlFor="models" className="block text-sm font-medium text-gray-700">
            Models
          </label>
          <select
            id="models"
            multiple
            value={formData.models}
            onChange={(e) => setFormData({ ...formData, models: Array.from(e.target.selectedOptions, option => option.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {availableModels.map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="display_name" className="block text-sm font-medium text-gray-700">
          Display Name
        </label>
        <input
          type="text"
          id="display_name"
          value={formData.display_name || ''}
          onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Display Name"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Most capable GPT-4 model..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <div className="mt-2">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <span className="ml-2">Active</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="max_tokens" className="block text-sm font-medium text-gray-700">
          Max Tokens
        </label>
        <input
          type="number"
          id="max_tokens"
          value={formData.max_tokens || ''}
          onChange={(e) => setFormData({ ...formData, max_tokens: parseInt(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="8192"
        />
      </div>

      {formData.provider && (
        <>
          <div>
            <label htmlFor="api_base" className="block text-sm font-medium text-gray-700">
              API Base URL
            </label>
            <input
              type="text"
              id="api_base"
              value={formData.api_base || ''}
              onChange={(e) => setFormData({ ...formData, api_base: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="https://api.provider.com"
            />
          </div>

          <div>
            <label htmlFor="api_key" className="block text-sm font-medium text-gray-700">
              API Key
            </label>
            <input
              type="password"
              id="api_key"
              value={formData.api_key || ''}
              onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Your API key"
            />
          </div>
        </>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="cost_per_token" className="block text-sm font-medium text-gray-700">
            Cost per Token (if same for input/output)
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
              $
            </span>
            <input
              type="number"
              id="cost_per_token"
              value={formData.cost_per_token || ''}
              onChange={(e) => setFormData({ ...formData, cost_per_token: parseFloat(e.target.value) })}
              step="0.000001"
              className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="0.000001"
            />
          </div>
        </div>

        <div>
          <label htmlFor="input_cost_per_token" className="block text-sm font-medium text-gray-700">
            Input Cost per Token
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
              $
            </span>
            <input
              type="number"
              id="input_cost_per_token"
              value={formData.input_cost_per_token || ''}
              onChange={(e) => setFormData({ ...formData, input_cost_per_token: parseFloat(e.target.value) })}
              step="0.000001"
              className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="0.000001"
            />
          </div>
        </div>

        <div>
          <label htmlFor="output_cost_per_token" className="block text-sm font-medium text-gray-700">
            Output Cost per Token
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
              $
            </span>
            <input
              type="number"
              id="output_cost_per_token"
              value={formData.output_cost_per_token || ''}
              onChange={(e) => setFormData({ ...formData, output_cost_per_token: parseFloat(e.target.value) })}
              step="0.000001"
              className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="0.000001"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {isEdit ? 'Update Model' : 'Create Model'}
        </button>
      </div>
    </form>
  );
}
