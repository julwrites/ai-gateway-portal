'use client';

import { useState, useEffect } from 'react';

export default function DebugInputsPage() {
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [stateInfo, setStateInfo] = useState({});
  
  // Log events with timestamps
  const logEvent = (message: string) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const logMessage = `${timestamp} - ${message}`;
    setEventLog(prev => [logMessage, ...prev].slice(0, 50)); // Keep last 50 events
  };
  
  useEffect(() => {
    logEvent('Component mounted');
    
    // Attempt to detect if we're running in Tauri
    const isTauri = typeof window !== 'undefined' && (window as any).__TAURI_IPC__ !== undefined;
    logEvent(`Running in Tauri environment: ${isTauri}`);
    
    // Update state info whenever inputs change
    updateStateInfo();
    
    return () => {
      logEvent('Component unmounting');
    };
  }, []);
  
  // Update state whenever inputs change
  useEffect(() => {
    updateStateInfo();
  }, [baseUrl, apiKey]);
  
  const updateStateInfo = () => {
    setStateInfo({
      baseUrl: {
        value: baseUrl,
        length: baseUrl.length,
        trimmedLength: baseUrl.trim().length,
        type: typeof baseUrl
      },
      apiKey: {
        value: apiKey ? '[HIDDEN]' : '[EMPTY]',
        length: apiKey.length,
        trimmedLength: apiKey.trim().length,
        type: typeof apiKey
      },
      timestamp: new Date().toISOString()
    });
  };
  
  // Handle base URL input
  const handleBaseUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    logEvent(`Base URL input changed: "${value}"`);
    setBaseUrl(value);
  };
  
  // Handle API key input
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    logEvent(`API Key input changed: length=${value.length}`);
    setApiKey(value);
  };
  
  // Create a direct DOM input (no React state)
  const checkDomInput = () => {
    const input = document.getElementById('direct-dom-input') as HTMLInputElement;
    if (input) {
      logEvent(`Direct DOM input value: "${input.value}"`);
    } else {
      logEvent('Direct DOM input not found');
    }
  };
  
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Input Event Debugging</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">React Controlled Inputs</h2>
          
          <div className="mb-4">
            <label className="block text-sm mb-1">Base URL:</label>
            <input
              type="text"
              value={baseUrl}
              onChange={handleBaseUrlChange}
              onFocus={() => logEvent('Base URL input focused')}
              onBlur={() => logEvent('Base URL input blurred')}
              className="w-full border rounded p-2"
              placeholder="Enter base URL"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm mb-1">API Key:</label>
            <input
              type="password"
              value={apiKey}
              onChange={handleApiKeyChange}
              onFocus={() => logEvent('API Key input focused')}
              onBlur={() => logEvent('API Key input blurred')}
              className="w-full border rounded p-2"
              placeholder="Enter API key"
            />
          </div>
          
          <button
            onClick={() => logEvent('Button clicked - State: ' + 
              `baseUrl=${baseUrl.length > 0 ? 'set' : 'empty'}, ` + 
              `apiKey=${apiKey.length > 0 ? 'set' : 'empty'}`)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Test Button
          </button>
        </div>
        
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Direct DOM Input (No React)</h2>
          
          <div className="mb-4">
            <label className="block text-sm mb-1">Direct Input:</label>
            <input
              id="direct-dom-input"
              type="text"
              className="w-full border rounded p-2"
              placeholder="Type here to test direct DOM"
            />
          </div>
          
          <button
            onClick={checkDomInput}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Check DOM Value
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">State Information</h2>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-80">
            {JSON.stringify(stateInfo, null, 2)}
          </pre>
        </div>
        
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Event Log</h2>
          <div className="bg-gray-100 p-2 rounded overflow-auto max-h-80">
            {eventLog.map((log, index) => (
              <div key={index} className="text-xs font-mono mb-1">{log}</div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6 border rounded p-4 bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Browser/Environment Information</h2>
        <pre className="text-xs overflow-auto max-h-40">
          {`User Agent: ${typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR'}\n` +
            `Platform: ${typeof window !== 'undefined' ? window.navigator.platform : 'SSR'}\n` +
            `Tauri Available: ${typeof window !== 'undefined' && (window as any).__TAURI_IPC__ !== undefined ? 'Yes' : 'No'}\n` +
            `Window Size: ${typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'SSR'}`}
        </pre>
      </div>
    </div>
  );
}
