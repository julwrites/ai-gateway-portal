/**
 * This utility module provides functions to interact with the Tauri backend
 * It serves as a replacement for the Next.js API routes in the desktop application
 */

// Keep a reference to the invoke function that will be set only in a browser environment
let invoke: ((cmd: string, args?: Record<string, unknown>) => Promise<any>) | null = null;

// This function dynamically loads the Tauri API only on the client side
const initTauriApi = async (): Promise<void> => {
  if (typeof window === 'undefined') return; // Not in a browser environment

  // Check if the Tauri object is available on the window
  if (window && (window as any).__TAURI__) {
    try {
      // Dynamically import the Tauri API to avoid SSR issues
      const { invoke: tauriInvoke } = await import('@tauri-apps/api/tauri');
      invoke = tauriInvoke;
    } catch (error) {
      console.warn('Error initializing Tauri API:', error);
      invoke = null;
    }
  } else {
    console.info('Tauri not detected, using Next.js API routes');
    invoke = null;
  }
};

// Initialize when imported on the client side
if (typeof window !== 'undefined') {
  initTauriApi().catch(console.error);
}

// Check if we're running in the Tauri app
export const isTauriApp = (): boolean => {
  return invoke !== null;
};

// API utility functions

/**
 * Test API connection - uses Tauri command in desktop app, fallbacks to Next.js API route in web app
 */
export async function testConnection() {
  if (isTauriApp() && invoke) {
    try {
      return await invoke('test_connection');
    } catch (error) {
      console.error('Error calling Tauri test_connection command:', error);
      throw error;
    }
  } else {
    // Fallback to using the Next.js API route
    const response = await fetch('/api/test');
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  }
}

/**
 * Test connection to external API - uses Tauri command in desktop app, fallbacks to Next.js API route in web app
 */
export async function testApiConnection(url: string, apiKey: string) {
  if (isTauriApp() && invoke) {
    try {
      return await invoke('test_api_connection', { 
        url, 
        api_key: apiKey 
      });
    } catch (error) {
      console.error('Error calling Tauri test_api_connection command:', error);
      throw error;
    }
  } else {
    // Fallback to using the Next.js API route
    const response = await fetch('/api/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, apiKey }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  }
}

// Add more API functions as needed, following the same pattern
