'use client';

import React, { useEffect, useState } from 'react';
import { ConfigDialog } from './ConfigDialog';
import { updateConfig, getConfig } from '../lib/config';

// Dynamic imports for Tauri APIs
let tauriImport: Promise<any> | null = null;
let eventImport: Promise<any> | null = null;

// Only import in browser environment to avoid SSR issues
if (typeof window !== 'undefined') {
  tauriImport = import('@tauri-apps/api/tauri')
    .catch(err => console.error('Failed to load Tauri API:', err));
  
  eventImport = import('@tauri-apps/api/event')
    .catch(err => console.error('Failed to load Tauri event API:', err));
}

export function ConfigDialogManagerClient() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{ key: string, title: string, value: string }>({ 
    key: '', 
    title: '',
    value: '' 
  });

  // Handle save action
  const handleSave = async (key: string, value: string): Promise<void> => {
    try {
      // Make sure Tauri API is loaded
      if (!tauriImport) {
        throw new Error('Tauri API not available');
      }
      
      const tauriModule = await tauriImport;
      
      // First, update using our config mechanism
      if (key === 'api_base_url') {
        await updateConfig({ apiBaseUrl: value });
      } else if (key === 'api_key') {
        await updateConfig({ apiKey: value });
      }
      
      // Also update using the Tauri backend directly for backward compatibility
      await tauriModule.invoke('set_config', { key, value });
      console.log(`Successfully saved ${key} with new value`);
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
      throw error; // Re-throw to let the dialog handle the error
    }
  };

  useEffect(() => {
    // Listen for show-config-dialog events from Tauri
    let unlisten: (() => void) | undefined;
    
    const setup = async () => {
      // Make sure both Tauri imports are available
      if (!tauriImport || !eventImport) {
        console.warn('Tauri APIs not available.');
        return;
      }
      
      try {
        // Wait for both imports to resolve
        const [tauriModule, eventModule] = await Promise.all([tauriImport, eventImport]);
        
        console.log("Setting up Tauri event listeners");
        
        // Get the current config
        const config = await tauriModule.invoke('get_config');
        console.log("Got config:", config);
        
        // Set up the event listener
        const unlistenPromise = await eventModule.listen('show-config-dialog', async (event: any) => {
          console.log("Received config dialog event:", event);
          const { key, title } = event.payload;
          
          // Get current value if available
          let currentValue = '';
          if (config && key in config) {
            currentValue = config[key] || '';
          }
          
          console.log(`Opening dialog for ${key} with value ${currentValue}`);
          
          setDialogConfig({ 
            key, 
            title,
            value: currentValue 
          });
          setDialogOpen(true);
        });
        
        unlisten = unlistenPromise;
      } catch (error) {
        console.error("Error setting up Tauri event listeners:", error);
      }
    };
    
    // Only run in browser environment and if needed modules can be imported
    if (typeof window !== 'undefined') {
      // We need to use a timeout to make sure the Tauri backend is fully initialized
      // This helps prevent race conditions
      const timeoutId = setTimeout(() => {
        setup();
      }, 500);
      
      return () => {
        clearTimeout(timeoutId);
        if (unlisten) {
          unlisten();
        }
      };
    }
    
    return undefined;
  }, []);

  if (!dialogOpen) return null;

  return (
    <ConfigDialog 
      onClose={() => setDialogOpen(false)}
      configKey={dialogConfig.key}
      title={dialogConfig.title}
      value={dialogConfig.value}
      onSave={handleSave}
    />
  );
}
