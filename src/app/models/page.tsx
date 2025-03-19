'use client';

import { useState, useEffect, useCallback } from 'react';
import { Model } from '@/types/models';
import { ModelList } from './components/ModelList';
import { useConfig } from '@/lib/config-context';

export default function ModelsPage() {
  const { apiBaseUrl, apiKey, isConfigured } = useConfig();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = useCallback(async () => {
    try {
      const response = await fetch('/api/models/list', {
        headers: {
          'X-API-Base-URL': apiBaseUrl,
          'X-API-Key': apiKey
        }
      });
      
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
  }, [apiBaseUrl, apiKey]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Models</h1>
      
      {loading ? (
        <div className="text-center py-4">Loading models...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : (
        <ModelList models={models} />
      )}
    </div>
  );
}
