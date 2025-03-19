'use client';

import { useState, useEffect } from 'react';
import { APIKeyFormData, KeyFormProps } from '@/types/keys';
import { isValidDuration } from '@/lib/validators';
import { useConfig } from '@/lib/config-context';

export function KeyForm({ onSubmit, onClose, initialData, isEdit = false }: KeyFormProps) {
  const { apiBaseUrl, apiKey } = useConfig();
  const [formData, setFormData] = useState<APIKeyFormData>(initialData || {});
  const [formError, setFormError] = useState<string | null>(null);
  const [newModel, setNewModel] = useState('');
  const [availableModels, setAvailableModels] = useState<{ model_id: string; display_name: string }[]>([]);

  useEffect(() => {
    if (apiBaseUrl && apiKey) {
      fetchModels();
    }
  }, [apiBaseUrl, apiKey]);

  const fetchModels = async () => {
    if (!apiBaseUrl || !apiKey) {
      console.error('API configuration not set');
      return;
    }
    
    try {
      const response = await fetch('/api/models/list', {
        headers: {
          'X-API-Base-URL': apiBaseUrl,
          'X-API-Key': apiKey
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      const data = await response.json();
      setAvailableModels(data.data);
    } catch (error) {
      console.error('Error fetching models:', error);
      setFormError('Failed to load available models');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (formData.budget_duration && !isValidDuration(formData.budget_duration)) {
      setFormError('Invalid budget duration format. Use formats like "30s", "30m", "30h", "30d", or "1mo".');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const addModel = () => {
    if (newModel && !formData.models?.includes(newModel)) {
      setFormData(prev => ({
        ...prev,
        models: [...(prev.models || []), newModel]
      }));
      setNewModel('');
    }
  };

  const removeModel = (index: number) => {
    setFormData(prev => ({
      ...prev,
      models: prev.models?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="key_alias" className="block text-sm font-medium text-gray-700">Key Alias</label>
        <input
          type="text"
          id="key_alias"
          value={formData.key_alias || ''}
          onChange={(e) => setFormData({ ...formData, key_alias: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="max_budget" className="block text-sm font-medium text-gray-700">Max Budget</label>
        <input
          type="number"
          id="max_budget"
          value={formData.max_budget || ''}
          onChange={(e) => setFormData({ ...formData, max_budget: parseFloat(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="budget_duration" className="block text-sm font-medium text-gray-700">Budget Duration</label>
        <select
          id="budget_duration"
          value={formData.budget_duration || ''}
          onChange={(e) => setFormData({ ...formData, budget_duration: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Select duration</option>
          <option value="1h">1 Hour</option>
          <option value="12h">12 Hours</option>
          <option value="1d">1 Day</option>
          <option value="7d">7 Days</option>
          <option value="30d">30 Days</option>
          <option value="1mo">1 Month</option>
        </select>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="tpm_limit" className="block text-sm font-medium text-gray-700">
            Tokens per Minute Limit
          </label>
          <input
            type="number"
            id="tpm_limit"
            value={formData.tpm_limit || ''}
            onChange={(e) => setFormData({ ...formData, tpm_limit: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm form-input"
            placeholder="1000"
          />
        </div>

        <div>
          <label htmlFor="rpm_limit" className="block text-sm font-medium text-gray-700">
            Requests per Minute Limit
          </label>
          <input
            type="number"
            id="rpm_limit"
            value={formData.rpm_limit || ''}
            onChange={(e) => setFormData({ ...formData, rpm_limit: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm form-input"
            placeholder="60"
          />
        </div>

        <div>
          <label htmlFor="max_parallel_requests" className="block text-sm font-medium text-gray-700">
            Max Parallel Requests
          </label>
          <input
            type="number"
            id="max_parallel_requests"
            value={formData.max_parallel_requests || ''}
            onChange={(e) => setFormData({ ...formData, max_parallel_requests: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm form-input"
            placeholder="10"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Models</label>
        <div className="mt-2 space-y-2">
          {formData.models?.map((model, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="flex-grow">{model}</span>
              <button
                type="button"
                onClick={() => removeModel(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="flex space-x-2">
            <select
              value={newModel}
              onChange={(e) => setNewModel(e.target.value)}
              className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select Model</option>
              {availableModels.map((model) => (
                <option key={model.model_id} value={model.model_id}>{model.display_name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={addModel}
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {formError && <p className="text-red-500 text-sm">{formError}</p>}

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
        >
          {isEdit ? 'Update Key' : 'Create Key'}
        </button>
      </div>
    </form>
  );
}
