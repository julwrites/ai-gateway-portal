'use client';

import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { testConnection, isTauriApp } from '@/lib/tauri-api';

export default function TestPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    // Check if we're running in the Tauri app (client-side only)
    setIsTauri(isTauriApp());
    
    const fetchTestData = async () => {
      try {
        logger.log('Fetching test data');
        
        // Use our Tauri API utility which handles both desktop and web scenarios
        const result = await testConnection();
        
        logger.log('Received data:', result);
        setData(result);
      } catch (err) {
        logger.error('Error fetching test data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    logger.log('Test page mounted');
    fetchTestData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      {isTauri && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded border border-green-200">
          ✅ Running in Tauri Desktop App
        </div>
      )}
      
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
