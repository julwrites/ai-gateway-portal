'use client';

import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { getConfig } from '@/lib/config';
import { getApiUrl, getHeaders } from '@/lib/config';

export default function TestPage() {
  const [configData, setConfigData] = useState<any>(null);
  const [apiTestData, setApiTestData] = useState<any>(null);
  const [liteLLMTestData, setLiteLLMTestData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runTests = async () => {
      try {
        logger.log('Starting API connection tests');
        setLoading(true);
        
        // 1. Get current configuration
        const config = getConfig();
        setConfigData({
          apiBaseUrl: config.apiBaseUrl,
          hasApiKey: !!config.apiKey,
        });
        
        // 2. Test local API route
        try {
          logger.log('Testing local API route');
          const apiResponse = await fetch('/api/test');
          
          if (!apiResponse.ok) {
            throw new Error(`HTTP error with local API! status: ${apiResponse.status}`);
          }
          
          const apiResult = await apiResponse.json();
          logger.log('Local API test result:', apiResult);
          setApiTestData(apiResult);
        } catch (apiError) {
          logger.error('Error testing local API:', apiError);
          setApiTestData({ error: apiError instanceof Error ? apiError.message : 'Local API test failed' });
        }
        
        // 3. Test LiteLLM API connection
        try {
          logger.log('Testing LiteLLM API connection');
          // Use a simple models list endpoint to test connection
          const liteLLMUrl = getApiUrl('/models');
          const headers = getHeaders();
          
          const liteLLMResponse = await fetch(liteLLMUrl, { 
            method: 'GET',
            headers 
          });
          
          if (!liteLLMResponse.ok) {
            throw new Error(`HTTP error with LiteLLM API! status: ${liteLLMResponse.status}`);
          }
          
          const liteLLMResult = await liteLLMResponse.json();
          logger.log('LiteLLM API test result:', liteLLMResult);
          setLiteLLMTestData({
            status: 'success',
            responseCode: liteLLMResponse.status,
            data: liteLLMResult
          });
        } catch (liteLLMError) {
          logger.error('Error testing LiteLLM API:', liteLLMError);
          setLiteLLMTestData({ 
            status: 'error',
            error: liteLLMError instanceof Error ? liteLLMError.message : 'LiteLLM API test failed' 
          });
        }
      } catch (err) {
        logger.error('Error running tests:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    logger.log('Test page mounted');
    runTests();
  }, []);

  if (loading) return <div className="p-4">Running connection tests...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  const isLiteLLMSuccess = liteLLMTestData && liteLLMTestData.status === 'success';

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">API Connection Test</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Configuration</h2>
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">API Base URL</dt>
                <dd className="mt-1 text-sm text-gray-900">{configData?.apiBaseUrl || 'Not set'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">API Key</dt>
                <dd className="mt-1 text-sm text-gray-900">{configData?.hasApiKey ? 'Set' : 'Not set'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Local API Test</h2>
        <div className={`rounded-md p-4 ${apiTestData?.error ? 'bg-red-50' : 'bg-green-50'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {apiTestData?.error ? (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-800">
                {apiTestData?.error ? 'Failed' : 'Success'}
              </h3>
              <div className="mt-2 text-sm text-gray-700">
                {apiTestData?.error ? (
                  <p>{apiTestData.error}</p>
                ) : (
                  <p>Local API route is working correctly.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">LiteLLM API Test</h2>
        <div className={`rounded-md p-4 ${isLiteLLMSuccess ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {isLiteLLMSuccess ? (
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-800">
                {isLiteLLMSuccess ? 'Connected Successfully' : 'Connection Failed'}
              </h3>
              <div className="mt-2 text-sm text-gray-700">
                {isLiteLLMSuccess ? (
                  <p>Successfully connected to LiteLLM API at {configData?.apiBaseUrl}</p>
                ) : (
                  <p>{liteLLMTestData?.error || 'Could not connect to LiteLLM API'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Response Details</h3>
        {isLiteLLMSuccess && (
          <div className="bg-gray-100 rounded p-4 overflow-auto max-h-96">
            <pre className="text-xs">{JSON.stringify(liteLLMTestData.data, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
