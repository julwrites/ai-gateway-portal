'use client';

import { useState, useEffect } from 'react';
import { APIKey, APIKeyFormData, APIKeyResponse } from '@/types/keys';
import { KeyList } from './components/KeyList';
import { KeyForm } from './components/KeyForm';

export default function KeysPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const response = await fetch('/api/keys/list');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch API keys');
        }
        
        const responseText = await response.text();
        console.log("Raw response from /api/keys/list:", responseText);
        
        const data: APIKeyResponse = JSON.parse(responseText);
        console.log("Parsed data from /api/keys/list:", data);
        
        if (Array.isArray(data.keys)) {
          console.log("Keys array:", data.keys);
          setKeys(data.keys);
        } else {
          console.error("Received keys is not an array:", data.keys);
          setKeys([]);
        }
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch API keys';
        console.error('Error in fetchKeys:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
  
    fetchKeys();
  }, []);

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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create API key');
      }
  
      const newKey: APIKey = await response.json();
      setKeys(prevKeys => [...prevKeys, newKey]);
      setShowCreateForm(false);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create API key';
      console.error('Error in handleCreateKey:', errorMessage);
      setError(errorMessage);
    }
  };
  
  const handleEditKey = async (key: APIKey) => {
    try {
      const response = await fetch('/api/keys/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(key),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update API key');
      }
  
      const updatedKey: APIKey = await response.json();
      setKeys(prevKeys => 
        prevKeys.map(k => k.key === updatedKey.key ? updatedKey : k)
      );
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update API key';
      console.error('Error in handleEditKey:', errorMessage);
      setError(errorMessage);
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete API key');
      }

      setKeys(prevKeys => prevKeys.filter(key => key.key !== keyId));
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete API key';
      console.error('Error in handleDeleteKey:', errorMessage);
      setError(errorMessage);
    }
  };

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
      
      {loading ? (
        <div className="text-center py-4">Loading API keys...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : (
        <KeyList 
          keys={keys} 
          onEdit={handleEditKey} 
          onDelete={handleDeleteKey} 
        />
      )}
      
      {showCreateForm && (
        <KeyForm 
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateKey}
        />
      )}
    </div>
  );
}