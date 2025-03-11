'use client';

import { useState } from 'react';
import { APIKeyFormData, KeyFormProps } from '@/types/keys';

export function KeyForm({ onSubmit, onClose, initialData, isEdit = false }: KeyFormProps) {
  const [formData, setFormData] = useState<APIKeyFormData>(initialData || {
    key_alias: '',
    models: [],
    max_budget: undefined,
    budget_duration: '',
    metadata: {},
    tpm_limit: undefined,
    rpm_limit: undefined,
    max_parallel_requests: undefined,
    permissions: {},
    model_max_budget: {}
  });

  const [newModel, setNewModel] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const addModel = () => {
    if (newModel) {
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
      models: prev.models?.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">{isEdit ? 'Edit API Key' : 'Create New API Key'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="key_alias" className="block text-sm font-medium text-gray-700">
          Key Name
        </label>
        <input
          type="text"
          id="key_alias"
          value={formData.key_alias || ''}
          onChange={(e) => setFormData({ ...formData, key_alias: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm form-input"
          placeholder="My API Key"
        />
      </div>

      <div>
        <label htmlFor="max_budget" className="block text-sm font-medium text-gray-700">
          Max Budget
        </label>
        <input
          type="number"
          id="max_budget"
          value={formData.max_budget || ''}
          onChange={(e) => setFormData({ ...formData, max_budget: parseFloat(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm form-input"
          placeholder="100"
        />
      </div>

      <div>
        <label htmlFor="budget_duration" className="block text-sm font-medium text-gray-700">
          Budget Duration
        </label>
        <select
          id="budget_duration"
          value={formData.budget_duration || ''}
          onChange={(e) => setFormData({ ...formData, budget_duration: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm form-select"
        >
          <option value="">Select duration</option>
          <option value="1h">1 Hour</option>
          <option value="12h">12 Hours</option>
          <option value="1d">1 Day</option>
          <option value="7d">7 Days</option>
          <option value="30d">30 Days</option>
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
            <input
              type="text"
              value={newModel}
              onChange={(e) => setNewModel(e.target.value)}
              placeholder="Model name (e.g., gpt-4)"
              className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm form-input"
            />
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
              {isEdit ? 'Update API Key' : 'Create API Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
