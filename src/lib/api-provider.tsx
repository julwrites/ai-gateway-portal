'use client';

import { ReactNode, useEffect } from 'react';
import { api, isTauriApp } from './tauri-api';

interface ApiProviderProps {
  children: ReactNode;
}

export function ApiProvider({ children }: ApiProviderProps) {
  useEffect(() => {
    // Initialize the API when the component mounts
    api.init().catch(error => {
      console.error('Failed to initialize API:', error);
    });

    // Log whether we're running in Tauri
    console.log(`Running in ${isTauriApp() ? 'Tauri desktop app' : 'browser'} environment`);
  }, []);

  return <>{children}</>;
}
