'use client';

import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import dynamic from 'next/dynamic';

// Use dynamic import for Tauri components to prevent server-side rendering issues
const ConfigDialogManagerClient = dynamic(() => import('./ConfigDialogClient').then(mod => mod.ConfigDialogManagerClient), {
  ssr: false
});

interface ConfigDialogProps {
  onClose: () => void;
  configKey: string;
  title: string;
  value?: string;
  onSave: (key: string, value: string) => Promise<void>;
}

export function ConfigDialog({ onClose, configKey, title, value = '', onSave }: ConfigDialogProps) {
  const [inputValue, setInputValue] = useState(value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update input value when props change
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSave(configKey, inputValue);
      onClose();
    } catch (err) {
      console.error('Failed to save config:', err);
      setError((err as Error)?.message || 'Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="configValue" className="block text-sm font-medium mb-1">
              Value
            </label>
            <input
              id="configValue"
              type={configKey === 'api_key' ? 'password' : 'text'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              placeholder={configKey === 'api_base_url' ? 'http://localhost:4000' : ''}
              required
            />
          </div>
          
          {error && (
            <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// This is a client-only component that renders the ConfigDialog manager
export function ConfigDialogManager() {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return null; // Return nothing during SSR
  }

  return <ConfigDialogManagerClient />;
}
