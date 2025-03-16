'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadConfig, updateConfig, getApiUrl, getHeaders } from '@/lib/config';
import { logger } from '@/lib/logger';

export default function SettingsAltPage() {
  const router = useRouter();
  const [initialConfig, setInitialConfig] = useState({ apiBaseUrl: '', apiKey: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});

  // Load the current configuration when the component mounts
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        console.log("Loading initial configuration...");
        const config = await loadConfig();
        setInitialConfig({
          apiBaseUrl: config.apiBaseUrl || '',
          apiKey: config.apiKey || ''
        });
        
        console.log("Configuration loaded:", {
          baseUrlSet: !!config.apiBaseUrl,
          apiKeySet: !!config.apiKey
        });
      } catch (error) {
        console.error("Error loading configuration:", error);
        setError("Failed to load configuration");
      }
    };

    fetchConfig();
  }, []);

  // Use a form submit handler instead of individual state values
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    
    try {
      // Get form data directly
      const formData = new FormData(e.currentTarget);
      const baseUrl = formData.get('baseUrl') as string;
      const apiKey = formData.get('apiKey') as string;
      
      // Debug info
      setDebugInfo({
        formValues: {
          baseUrl,
          apiKey: apiKey ? '[SET]' : '[EMPTY]'
        },
        formValueLengths: {
          baseUrlLength: baseUrl.length,
          apiKeyLength: apiKey.length
        }
      });
      
      // Update config
      await updateConfig({
        apiBaseUrl: baseUrl,
        apiKey: apiKey
      });
      
      // Test connection
      const healthUrl = `${baseUrl}/health`;
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Connection failed with status: ${response.status}`);
      }
      
      const healthData = await response.json();
      logger.log('Health check response:', healthData);
      
      setIsSuccess(true);
      
      // Redirect after successful connection
      setTimeout(() => {
        router.push('/');
      }, 2000);
      
    } catch (error) {
      console.error('Connection test error:', error);
      setError(error instanceof Error ? error.message : 'Connection test failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 bg-white p-8 shadow-lg rounded-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">LiteLLM Gateway Settings (Alt)</h1>
          <p className="text-sm text-gray-500 mt-2">
            Alternative form implementation
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-700">
              API Base URL
            </label>
            <input
              id="baseUrl"
              name="baseUrl"
              type="text"
              defaultValue={initialConfig.apiBaseUrl}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              placeholder="http://localhost:4000"
              required
            />
          </div>
          
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
              API Key
            </label>
            <input
              id="apiKey"
              name="apiKey"
              type="password"
              defaultValue={initialConfig.apiKey}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              placeholder="Your API key"
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {isSuccess && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Connection successful! Redirecting to dashboard...
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:bg-gray-400"
          >
            {isLoading ? 'Testing Connection...' : 'Connect and Save'}
          </button>
          
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
            <h3 className="font-medium mb-1">Debug Information:</h3>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            <p className="mt-2 text-xs">This form uses native HTML form submission rather than React state for inputs.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
