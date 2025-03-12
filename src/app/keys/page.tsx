'use client';

import { useState, useEffect } from 'react';
import { APIKey, APIKeyFormData } from '@/types/keys';
import { KeyList } from './components/KeyList';
import { KeyForm } from './components/KeyForm';

export default function KeysPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const response = await fetch('/api/keys/list');
      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }
      const data = await response.json();
      setKeys(data.keys);
      setError(null);
    } catch (err) {
      setError('Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (data: APIKeyFormData) => {
    try {
      const response = await fetch('/api/keys/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create API key');
      }

      // Instead of updating the local state, refresh the entire user list
      await fetchKeys();
      setShowCreateForm(false);
      setError(null);
    } catch (err) {
      setError('Failed to create API key');
    }
  };

  const handleEditKey = async (updatedKey: APIKey) => {
    try {
      const response = await fetch('/api/keys/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedKey),
      });

      if (!response.ok) {
        throw new Error('Failed to update API key');
      }

      // Instead of updating the local state, refresh the entire user list
      await fetchKeys();
      setError(null);
    } catch (err) {
      setError('Failed to update API key');
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    try {
      const response = await fetch('/api/keys/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keys: [keyId] }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete API key');
      }

      setKeys(prevKeys => prevKeys.filter(key => key.id !== keyId));
      setError(null);
    } catch (err) {
      setError('Failed to delete API key');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">API Keys Management</h1>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create API Key
        </button>
      </div>
      
      <KeyList 
        keys={keys} 
        onEdit={handleEditKey} 
        onDelete={handleDeleteKey} 
      />
      
      {showCreateForm && (
        <KeyForm 
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateKey}
        />
      )}
    </div>
  );
}