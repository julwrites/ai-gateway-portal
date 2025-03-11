'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        const response = await fetch('/api/debug');
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch debug info');
        }
        
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDebugInfo();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Environment</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(data.environment, null, 2)}
        </pre>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">LiteLLM Health Check</h2>
        <div className="mb-2">
          Status: <span className={data.litellm.status === 200 ? "text-green-500" : "text-red-500"}>
            {data.litellm.status}
          </span>
        </div>
        <pre className="bg-gray-100 p-4 rounded">
          {data.litellm.response}
        </pre>
      </div>
    </div>
  );
}
