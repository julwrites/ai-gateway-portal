'use client';

import { useState } from 'react';
import { TeamFormData, TeamFormProps, Member } from '@/types/teams';

export function TeamForm({ onSubmit, onClose, initialData, isEdit = false }: TeamFormProps) {
  const [formData, setFormData] = useState<TeamFormData>(initialData || {
    team_alias: '',
    models: [],
    max_budget: undefined,
    budget_duration: '',
    metadata: {},
    tpm_limit: undefined,
    rpm_limit: undefined,
    members_with_roles: [],
    organization_id: undefined,
    blocked: false,
    max_parallel_requests: undefined,
    tags: [],
    model_aliases: {},
    guardrails: {}
  });

  const [newMember, setNewMember] = useState<Member>({ user_id: '', role: 'user' });
  const [newModel, setNewModel] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const validateForm = () => {
    if (!formData.team_alias) {
      setFormError('Team name is required');
      return false;
    }
    // Add more validation as needed
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    try {
      await onSubmit(formData);
      setFormError(null);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'An error occurred while submitting the form');
    }
  };

  const addMember = () => {
    if (newMember.user_id) {
      setFormData(prev => ({
        ...prev,
        members_with_roles: [
          ...(prev.members_with_roles || []),
          { user_id: newMember.user_id, role: newMember.role }
        ]
      }));
      setNewMember({ user_id: '', role: 'user' });
    }
  };

  const removeMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      members_with_roles: prev.members_with_roles?.filter((_, i) => i !== index)
    }));
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="team_alias" className="block text-sm font-medium text-gray-700">
          Team Name
        </label>
        <input
          type="text"
          id="team_alias"
          value={formData.team_alias}
          onChange={(e) => setFormData({ ...formData, team_alias: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="budget_duration" className="block text-sm font-medium text-gray-700">
          Budget Duration
        </label>
        <select
          id="budget_duration"
          value={formData.budget_duration}
          onChange={(e) => setFormData({ ...formData, budget_duration: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
        <label className="block text-sm font-medium text-gray-700">Members</label>
        <div className="mt-2 space-y-2">
          {formData.members_with_roles?.map((member, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="flex-grow">{member.user_id} ({member.role})</span>
              <button
                type="button"
                onClick={() => removeMember(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMember.user_id}
              onChange={(e) => setNewMember({ ...newMember, user_id: e.target.value })}
              placeholder="User ID"
              className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <select
              value={newMember.role}
              onChange={(e) => setNewMember({ ...newMember, role: e.target.value as 'admin' | 'user' })}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="button"
              onClick={addMember}
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              Add
            </button>
          </div>
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
              placeholder="Model name"
              className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
          {isEdit ? 'Update Team' : 'Create Team'}
        </button>
      </div>
    </form>
  );
}
