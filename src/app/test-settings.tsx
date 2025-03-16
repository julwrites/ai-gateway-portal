'use client';

import React, { useState, useEffect } from 'react';

export default function TestSettings() {
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});

  // Update button state whenever inputs change
  useEffect(() => {
    const hasBaseUrl = baseUrl.trim().length > 0;
    const hasApiKey = apiKey.trim().length > 0;
    const shouldEnableButton = hasBaseUrl && hasApiKey;
    
    setDebugInfo({
      baseUrl,
      apiKey: apiKey ? '[SET]' : '[EMPTY]',
      baseUrlLength: baseUrl.length,
      baseUrlTrimLength: baseUrl.trim().length,
      apiKeyLength: apiKey.length,
      apiKeyTrimLength: apiKey.trim().length,
      hasBaseUrl,
      hasApiKey,
      shouldEnableButton
    });
    
    setButtonEnabled(shouldEnableButton);
  }, [baseUrl, apiKey]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 bg-white p-8 shadow-lg rounded-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Test Settings Form</h1>
          <p className="text-sm text-gray-500 mt-2">
            Simple form to test input handling
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
              onChange={(e) => setBaseUrl(e.target.value)}
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
              onChange={(e) => setApiKey(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              placeholder="Your API Key"
              required
            />
          </div>
          
          <button
            onClick={() => alert('Button clicked!')}
            disabled={!buttonEnabled}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 disabled:bg-gray-400"
          >
            Test Button
          </button>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Debug Information:</h3>
            <pre className="text-xs overflow-auto max-h-40">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
