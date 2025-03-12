"use client";

import { useState } from 'react';
import { UserRequest, UserFormProps, UserRole } from '@/types/users';
import { validateUserData } from '@/lib/validators';

export function UserForm({ onSubmit, onClose, initialData, isEdit = false }: UserFormProps) {
  const [formData, setFormData] = useState<UserRequest>(initialData || {
    user_email: '',
    user_role: 'internal_user',
    teams: [],
    max_budget: undefined,
    models: [],
    tpm_limit: undefined,
    rpm_limit: undefined,
    budget_duration: undefined,
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateUserData(formData);
    if (error) {
      setFormError(error);
      return;
    }
    try {
      await onSubmit(formData);
      setFormError(null);
      onClose(); // Close the form after successful submission
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'An error occurred while submitting the form');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {isEdit ? 'Edit User' : 'Create User'}
        </h2>
        
        {formError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{formError}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.user_email || ''}
              onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Role
            </label>
            <select
              value={formData.user_role}
              onChange={(e) => setFormData({ ...formData, user_role: e.target.value as UserRole })}
              className="w-full p-2 border rounded"
              required
            >
              <option value="internal_user">Internal User</option>
              <option value="internal_user_viewer">Internal User (Viewer)</option>
              <option value="proxy_admin">Admin</option>
              <option value="proxy_admin_viewer">Admin (Viewer)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Max Budget
            </label>
            <input
              type="number"
              value={formData.max_budget || ''}
              onChange={(e) => setFormData({ ...formData, max_budget: parseFloat(e.target.value) || undefined })}
              className="w-full p-2 border rounded"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Budget Duration
            </label>
            <select
              value={formData.budget_duration || ''}
              onChange={(e) => setFormData({ ...formData, budget_duration: e.target.value || undefined })}
              className="w-full p-2 border rounded"
            >
              <option value="">Select duration</option>
              <option value="1d">1 Day</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="1h">1 Hour</option>
              <option value="12h">12 Hours</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Rate Limits
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                value={formData.tpm_limit || ''}
                onChange={(e) => setFormData({ ...formData, tpm_limit: parseInt(e.target.value) || undefined })}
                className="p-2 border rounded"
                placeholder="TPM Limit"
              />
              <input
                type="number"
                value={formData.rpm_limit || ''}
                onChange={(e) => setFormData({ ...formData, rpm_limit: parseInt(e.target.value) || undefined })}
                className="p-2 border rounded"
                placeholder="RPM Limit"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {isEdit ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
