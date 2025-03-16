'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadConfig, updateConfig, getApiUrl, getHeaders } from '@/lib/config';
import { logger } from '@/lib/logger';

export default function SettingsUncontrolledPage() {
  const router = useRouter();
  const baseUrlRef = useRef<HTMLInputElement>(null);
  const apiKeyRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formState, setFormState] = useState({
    baseUrlValue: '',
    apiKeyValue: '',
    baseUrlIsValid: false,
    apiKeyIsValid: false,
    buttonShouldBeEnabled: false
  });

  // Load the current configuration when the component mounts
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        console.log("Loading configuration...");
        const config = await loadConfig();
        
        // Instead of using state, we set the refs directly
        if (baseUrlRef.current) baseUrlRef.current.value = config.apiBaseUrl || '';
        if (apiKeyRef.current) apiKeyRef.current.value = config.apiKey || '';
        
        // Update form state for debugging
        updateFormState();
        
        console.log("Configuration loaded to refs");
      } catch (error) {
        console.error("Error loading configuration:", error);
        setError("Failed to load configuration");
      }
    };

    fetchConfig();
  }, []);

  // Update form state for debugging
  const updateFormState = () => {
    if (!baseUrlRef.current || !apiKeyRef.current) return;
    
    const baseUrlValue = baseUrlRef.current.value;
    const apiKeyValue = apiKeyRef.current.value;
    const baseUrlIsValid = baseUrlValue.trim().length > 0;
    const apiKeyIsValid = apiKeyValue.trim().length > 0;
    
    setFormState({
      baseUrlValue,
      apiKeyValue: apiKeyValue ? '[SET]' : '[EMPTY]',
      baseUrlIsValid,
      apiKeyIsValid,
      buttonShouldBeEnabled: baseUrlIsValid && apiKeyIsValid
    });
  };

  // Test the connection to the LiteLLM backend
  const testConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!baseUrlRef.current || !apiKeyRef.current) {
      setError("Form initialization error");
      return;
    }
    
    const baseUrl = baseUrlRef.current.value;
    const apiKey = apiKeyRef.current.value;
    
    // Validate inputs
    if (!baseUrl.trim() || !apiKey.trim()) {
      setError("Please enter both Base URL and API Key");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    
    try {
      // First update the config with the new values
      await updateConfig({
        apiBaseUrl: baseUrl,
        apiKey: apiKey
      });
      
      // Test connection to the health endpoint
      const healthUrl = `${baseUrl}/health`;
      
      logger.log('Testing connection to:', healthUrl);
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
      
      // If we get a successful response, store the configuration and show success
      const healthData = await response.json();
      logger.log('Health check response:', healthData);
      
      setIsSuccess(true);
      
      // Redirect to dashboard after a brief delay to show the success message
      setTimeout(() => {
        router.push('/');
      }, 2000);
      
    } catch (error) {
      logger.error('Connection test error:', error);
      setError(error instanceof Error ? error.message : 'Connection test failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 bg-white p-8 shadow-lg rounded-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Settings (Uncontrolled Inputs)</h1>
          <p className="text-sm text-gray-500 mt-2">
            This page uses uncontrolled inputs with refs
          </p>
        </div>
        
        <form onSubmit={testConnection} className="space-y-4">
          <div>
            <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-700">
              API Base URL
            </label>
            <input
              id="baseUrl"
              name="baseUrl"
              type="text"
              ref={baseUrlRef}
              onChange={updateFormState}
              onBlur={updateFormState}
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
              ref={apiKeyRef}
              onChange={updateFormState}
              onBlur={updateFormState}
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
            <pre className="overflow-auto text-xs max-h-40">
              {JSON.stringify(formState, null, 2)}
            </pre>
            <p className="mt-2 text-xs">This form uses uncontrolled inputs with refs</p>
            <p className="text-xs">The browser's native form validation is used to enable/disable the button</p>
          </div>
        </form>
      </div>
    </div>
  );
}
