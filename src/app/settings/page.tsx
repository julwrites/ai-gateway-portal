'use client';

import React, { useState, FormEvent } from 'react';
import { useConfig } from '@/lib/config-context';

export default function SettingsPage() {
  const { apiBaseUrl, apiKey, updateConfig } = useConfig();
  const [formBaseUrl, setFormBaseUrl] = useState(apiBaseUrl);
  const [formApiKey, setFormApiKey] = useState(apiKey);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    setError('');
    setSuccess('');

    try {
      // Ensure base URL is properly formatted
      const baseUrl = formBaseUrl.endsWith('/')
        ? formBaseUrl.slice(0, -1)
        : formBaseUrl;

      // Test connection by trying to fetch models
      const response = await fetch(`${baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${formApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      // Connection successful, update the configuration
      updateConfig(baseUrl, formApiKey);
      setSuccess('Configuration updated successfully.');
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
    <div>
      <h1 className="text-2xl font-bold mb-6">API Settings</h1>
      <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
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
              value={formBaseUrl}
              onChange={(e) => setFormBaseUrl(e.target.value)}
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
              value={formApiKey}
              onChange={(e) => setFormApiKey(e.target.value)}
            />
            <p className="mt-1 text-sm text-gray-500">Your key will be stored securely in your browser.</p>
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
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={testing}
            >
              {testing ? 'Testing Connection...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
