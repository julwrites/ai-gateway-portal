'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useConfig } from '@/lib/config-context';

export default function ConfigScreen() {
  const { updateConfig, isConfigured, apiBaseUrl: configuredBaseUrl, apiKey: configuredApiKey } = useConfig();
  const router = useRouter();
  const [apiBaseUrl, setApiBaseUrl] = useState('http://localhost:4000');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testing, setTesting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Initialize form with existing values if available
  useEffect(() => {
    console.log('Config screen mounted, checking for existing config');
    if (configuredBaseUrl && configuredBaseUrl !== 'http://localhost:4000') {
      console.log('Setting form values from existing config');
      setApiBaseUrl(configuredBaseUrl);
    }
    
    if (configuredApiKey) {
      setApiKey(configuredApiKey);
    }
  }, [configuredBaseUrl, configuredApiKey]);

  // If already configured, redirect to home, but only if we have a valid API key
  useEffect(() => {
    console.log('Checking if already configured:', isConfigured);
    // Only redirect if:
    // 1. The user is configured
    // 2. We're not already in the process of redirecting
    // 3. We have a valid API key (not empty)
    if (isConfigured && !redirecting && configuredApiKey && configuredApiKey.trim() !== '') {
      console.log('User is configured with valid API key, redirecting to dashboard');
      router.push('/');
    } else if (isConfigured) {
      console.log('User is marked as configured but API key is invalid or empty');
    }
  }, [isConfigured, router, redirecting, configuredApiKey]);

  const testConnection = async () => {
    setTesting(true);
    setError('');
    setSuccess('');

    try {
      console.log('Testing connection with:', apiBaseUrl);
      
      // Ensure base URL is properly formatted
      const baseUrl = apiBaseUrl.endsWith('/')
        ? apiBaseUrl.slice(0, -1)
        : apiBaseUrl;

      console.log('Using API base URL:', baseUrl);
      
      // Try the local API test endpoint first
      // Test the API connection
      const testResponse = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: baseUrl, apiKey })
      });
      
      if (!testResponse.ok) {
        throw new Error(`Test API returned status ${testResponse.status}`);
      }
      
      const testData = await testResponse.json();
      console.log('Test response:', testData);
      
      if (!testData.success) {
        throw new Error(testData.message || 'API test failed');
      }
      
      // Connection successful, update the configuration
      console.log('Connection test successful, updating config');
      setSuccess('Connection successful! Redirecting to dashboard...');
      
      // Update config
      updateConfig(baseUrl, apiKey);
      
      // Set redirecting flag
      setRedirecting(true);
      
      // Delay redirect to allow time for state updates and cookie setting
      setTimeout(() => {
        console.log('Redirecting to home page');
        window.location.href = '/'; // Use direct location change instead of router
      }, 1500);
    } catch (err) {
      console.error('Connection test failed:', err);
      setError('Connection failed. Please check your Base URL and API Key.');
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    testConnection();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold">LiteLLM Admin Portal</h1>
          <p className="mt-2 text-gray-600">Please configure your API settings to continue</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="apiBaseUrl" className="block text-sm font-medium text-gray-700">
              Base URL
            </label>
            <input
              id="apiBaseUrl"
              name="apiBaseUrl"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="http://localhost:4000"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
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
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Your API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">Your API key will be stored securely in your browser.</p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Success</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>{success}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={testing || redirecting}
            >
              {testing ? 'Testing Connection...' : redirecting ? 'Redirecting...' : 'Connect to API'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
