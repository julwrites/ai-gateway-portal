'use client';

import { useState, useEffect } from 'react';
import { Model, ModelFormData } from '@/types/models';
import { getHeaders, getApiUrl } from '@/lib/config';
import { ModelList } from './components/ModelList';
import { ModelForm } from './components/ModelForm';

export default function ModelsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModel, setEditModel] = useState<Model | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/models/list');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch models');
        }
        
        const { data } = await response.json();
        
        setModels(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch models';
        console.error('Error in fetchModels:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  const handleCreateModel = async (data: ModelFormData) => {
    try {
      const response = await fetch('/api/models/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create model');
      }

      const { data: newModel } = await response.json();
      setModels(prevModels => [...prevModels, newModel]);
      setShowCreateForm(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create model';
      console.error('Error in handleCreateModel:', errorMessage);
      setError(errorMessage);
    }
  };

  const handleEditModel = (model: Model) => {
    setEditModel(model);
    setShowCreateForm(true);
  };

  const handleEditSubmit = async (data: ModelFormData) => {
    try {
      const response = await fetch(`/api/models/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update model');
      }

      const { data: updatedModel } = await response.json();
      setModels(prevModels => 
        prevModels.map(model => 
          model.model_id === updatedModel.model_id ? updatedModel : model
        )
      );
      setShowCreateForm(false);
      setEditModel(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update model';
      console.error('Error in handleEditSubmit:', errorMessage);
      setError(errorMessage);
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    try {
      const response = await fetch(`/api/models/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model_id: modelId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete model');
      }

      setModels(prevModels => prevModels.filter(model => model.model_id !== modelId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete model';
      console.error('Error in handleDeleteModel:', errorMessage);
      setError(errorMessage);
    }
  };

  const handleToggleActive = async (modelId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/models/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model_id: modelId, is_active: isActive }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update model');
      }

      const { data: updatedModel } = await response.json();
      setModels(prevModels => 
        prevModels.map(model => 
          model.model_id === updatedModel.model_id ? updatedModel : model
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update model';
      console.error('Error in handleToggleActive:', errorMessage);
      setError(errorMessage);
    }
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
    setEditModel(null);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Models Management</h1>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Model
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-4">Loading models...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : (
        <ModelList 
          models={models} 
          onEdit={handleEditModel} 
          onDelete={handleDeleteModel}
          onToggleActive={handleToggleActive}
        />
      )}
      
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ModelForm 
              onClose={handleCloseForm}
              onSubmit={editModel ? handleEditSubmit : handleCreateModel}
              initialData={editModel || undefined}
              isEdit={!!editModel}
            />
          </div>
        </div>
      )}
    </div>
  );
}
