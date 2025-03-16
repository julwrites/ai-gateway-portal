'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { loadConfig, updateConfig, getConfig, getApiUrl, getHeaders } from '@/lib/config';
import { logger } from '@/lib/logger';

export default function SettingsPage() {
  const router = useRouter();
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [buttonEnabled, setButtonEnabled] = useState(false);
  
  // Use this to update button state whenever inputs change
  useEffect(() => {
    const hasBaseUrl = baseUrl.trim().length > 0;
    const hasApiKey = apiKey.trim().length > 0;
    const shouldEnableButton = hasBaseUrl && hasApiKey && !isLoading;
    
    console.log('Input state:', { 
      baseUrl: hasBaseUrl ? 'set' : 'empty', 
      apiKey: hasApiKey ? 'set' : 'empty',
      buttonEnabled: shouldEnableButton
    });
    
    setButtonEnabled(shouldEnableButton);
  }, [baseUrl, apiKey, isLoading]);

  // Load the current configuration when the component mounts
  useEffect(() => {
    // Clear the config_verified cookie so the user must verify settings again
    document.cookie = "config_verified=false; path=/; max-age=0";
    
    // Set a timeout to prevent component loading issues
    const timeoutId = setTimeout(() => {
      const fetchConfig = async () => {
        try {
          console.log("Fetching configuration...");
          
          // For Tauri environment, first try to use window.__TAURI__
          if (typeof window !== 'undefined' && (window as any).__TAURI_IPC__) {
            try {
              console.log("Directly querying Tauri config...");
              const result = await (window as any).__TAURI__.invoke('get_config');
              console.log("Tauri config result:", result);
              
              if (result) {
                setBaseUrl(result.api_base_url || '');
                setApiKey(result.api_key || '');
                setConfigLoaded(true);
                return;
              }
            } catch (tauriError) {
              console.error("Error getting Tauri config directly:", tauriError);
            }
          }
          
          // Fall back to the standard config loader
          const config = await loadConfig();
          console.log("Config loaded via lib:", { 
            baseUrlSet: !!config.apiBaseUrl, 
            apiKeySet: !!config.apiKey 
          });
          
          setBaseUrl(config.apiBaseUrl || '');
          setApiKey(config.apiKey || '');
          setConfigLoaded(true);
        } catch (error) {
          console.error("Error loading configuration:", error);
          setError("Failed to load configuration. Please try again.");
          setConfigLoaded(true);
        }
      };

      fetchConfig();
    }, 300); // Short delay to ensure component is fully mounted
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Test the connection to the LiteLLM backend
  const testConnection = async () => {
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
      const healthUrl = getApiUrl('/health');
      const headers = getHeaders();
      
      logger.log('Testing connection to:', healthUrl);
      const response = await fetch(healthUrl, { 
        method: 'GET',
        headers,
        // Adding no-cache to avoid cached responses
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Connection failed with status: ${response.status}`);
      }
      
      // If we get a successful response, store the configuration and show success
      const healthData = await response.json();
      logger.log('Health check response:', healthData);
      
      setIsSuccess(true);
      
      // Set cookie to indicate verified configuration
      document.cookie = `config_verified=true; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 days
      
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
          <h1 className="text-2xl font-bold">LiteLLM Gateway Settings</h1>
          <p className="text-sm text-gray-500 mt-2">
            Configure your connection to the LiteLLM backend
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-700">
              API Base URL
            </label>
            <input
              id="baseUrl"
              type="text"
              value={baseUrl}
              onChange={(e) => {
                const newValue = e.target.value;
                console.log('Base URL input changed to:', newValue);
                setBaseUrl(newValue);
              }}
              onBlur={(e) => {
                console.log('Base URL input blur, current value:', e.target.value);
              }}
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
              type="password"
              value={apiKey}
              onChange={(e) => {
                const newValue = e.target.value;
                console.log('API Key input changed to:', newValue.length > 0 ? '[SET]' : '[EMPTY]');
                setApiKey(newValue);
              }}
              onBlur={(e) => {
                console.log('API Key input blur, has value:', e.target.value.length > 0);
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              placeholder="Your API key"
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
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
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Connection successful! Redirecting to dashboard...
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Use a plain HTML button as fallback in case there's an issue with the Button component */}
          <button
            onClick={testConnection}
            disabled={isLoading || !baseUrl.trim() || !apiKey.trim()}
            className="w-full h-10 px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:bg-gray-400"
          >
            {isLoading ? 'Testing Connection...' : 'Connect and Save'}
          </button>
          
          {(isLoading || !baseUrl.trim() || !apiKey.trim()) && configLoaded && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Please enter both Base URL and API Key to enable the button
            </p>
          )}
          
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600 space-y-1">
            <p>Debug info: Base URL set: {baseUrl ? 'Yes' : 'No'}, value: {baseUrl || '[empty]'}</p>
            <p>API Key set: {apiKey ? 'Yes' : 'No'}, length: {apiKey.length}</p>
            <p>Base URL trimmed length: {baseUrl.trim().length}</p>
            <p>API Key trimmed length: {apiKey.trim().length}</p>
            <p>Button should be {isLoading || !baseUrl.trim() || !apiKey.trim() ? 'disabled' : 'enabled'}</p>
            <p>State updates: {buttonEnabled ? 'Working' : 'Not working'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
