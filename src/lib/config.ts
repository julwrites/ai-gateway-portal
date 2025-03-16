// Use dynamic imports for Tauri APIs to avoid SSR issues
let invoke: any;
let listen: any;
let tauriIsReady = false;

// Only import Tauri APIs on the client side
if (typeof window !== 'undefined') {
  Promise.all([
    import('@tauri-apps/api/tauri'),
    import('@tauri-apps/api/event')
  ]).then(([tauriModule, eventModule]) => {
    invoke = tauriModule.invoke;
    listen = eventModule.listen;
    tauriIsReady = true;
    console.log('Tauri APIs loaded successfully');
  }).catch(err => console.error('Failed to load Tauri APIs:', err));
}

interface Config {
  apiBaseUrl: string;
  apiKey: string;
}

// Initial default configuration
const defaultConfig: Config = {
  apiBaseUrl: 'http://localhost:4000',
  apiKey: '',
};


// Store the config here, to be updated when the app loads or when changed
let currentConfig: Config = { ...defaultConfig };

// Check if running in Tauri environment
const isTauri = () => {
  return typeof window !== 'undefined' && window.__TAURI_IPC__ !== undefined;
};

// Load configuration from Tauri if available, otherwise localStorage, or env variables as fallback
export async function loadConfig(): Promise<Config> {
  try {
    // If in Tauri environment but APIs aren't ready yet, wait for them
    if (isTauri() && !tauriIsReady) {
      console.log("Waiting for Tauri APIs to load...");
      // Wait for Tauri APIs to be ready (max 2 seconds)
      await new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (tauriIsReady) {
            clearInterval(checkInterval);
            resolve(true);
          }
        }, 100);
        
        // Timeout after 2 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          console.warn('Timed out waiting for Tauri APIs');
          resolve(false);
        }, 2000);
      });
    }
    
    // Try to load from Tauri first if available and ready
    if (isTauri() && tauriIsReady) {
      try {
        console.log("Loading config from Tauri backend");
        // Get config from Rust backend
        const config = await invoke('get_config');
        if (config) {
          currentConfig = {
            apiBaseUrl: config.api_base_url || currentConfig.apiBaseUrl,
            apiKey: config.api_key || currentConfig.apiKey,
          };
          console.log("Successfully loaded config from Tauri");
        }
      } catch (error) {
        console.warn('Failed to load config from Tauri:', error);
        // Fall back to localStorage
        fallbackToLocalStorage();
      }
    } 
    // Browser environment but not Tauri or Tauri APIs not ready
    else if (typeof window !== 'undefined') {
      console.log("Loading config from localStorage");
      fallbackToLocalStorage();
    } 
    // Server-side rendering
    else {
      console.log("Loading config from env variables (server-side)");
      // Server-side, use env variables
      currentConfig = {
        apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || defaultConfig.apiBaseUrl,
        apiKey: process.env.LITELLM_API_KEY || defaultConfig.apiKey,
      };
    }
    
    // Log configuration on load (excluding sensitive data)
    console.log('API Base URL:', currentConfig.apiBaseUrl);
    console.log('API Key configured:', !!currentConfig.apiKey);
    
    return currentConfig;
  } catch (error) {
    console.error('Failed to load configuration:', error);
    return defaultConfig;
  }
}

// Helper function to load from localStorage
function fallbackToLocalStorage() {
  const storedBaseUrl = localStorage.getItem('litellm_api_base_url');
  const storedApiKey = localStorage.getItem('litellm_api_key');
  
  currentConfig = {
    apiBaseUrl: storedBaseUrl || process.env.NEXT_PUBLIC_API_BASE_URL || defaultConfig.apiBaseUrl,
    apiKey: storedApiKey || process.env.LITELLM_API_KEY || defaultConfig.apiKey,
  };
}

// Call loadConfig on module import
loadConfig().catch(console.error);

// Get the current configuration
export function getConfig(): Config {
  return currentConfig;
}

// Update config (used when changed from UI)
export async function updateConfig(newConfig: Partial<Config>): Promise<void> {
  currentConfig = { ...currentConfig, ...newConfig };
  
  // Update in Tauri if available and APIs are ready
  if (isTauri() && tauriIsReady) {
    try {
      // Update using Tauri invoke to update backend store
      if (newConfig.apiBaseUrl) {
        console.log('Setting Tauri config: api_base_url');
        await invoke('set_config', { key: 'api_base_url', value: newConfig.apiBaseUrl });
      }
      if (newConfig.apiKey) {
        console.log('Setting Tauri config: api_key');
        await invoke('set_config', { key: 'api_key', value: newConfig.apiKey });
      }
      
    } catch (error) {
      console.error('Failed to update Tauri config:', error);
      // Fall back to localStorage
      if (newConfig.apiBaseUrl) {
        localStorage.setItem('litellm_api_base_url', newConfig.apiBaseUrl);
      }
      if (newConfig.apiKey) {
        localStorage.setItem('litellm_api_key', newConfig.apiKey);
      }
    }
  } 
  // Browser environment but not Tauri or Tauri APIs not ready
  else if (typeof window !== 'undefined') {
    console.log('Saving config to localStorage');
    if (newConfig.apiBaseUrl) {
      localStorage.setItem('litellm_api_base_url', newConfig.apiBaseUrl);
    }
    if (newConfig.apiKey) {
      localStorage.setItem('litellm_api_key', newConfig.apiKey);
    }
  }
  
  console.log('Configuration updated');
  console.log('API Base URL:', currentConfig.apiBaseUrl);
  console.log('API Key configured:', !!currentConfig.apiKey);
}

export function getHeaders() {
  if (!currentConfig.apiKey) {
    console.warn('No API key configured');
  }
  
  return {
    'Authorization': `Bearer ${currentConfig.apiKey}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}

export function getApiUrl(path: string) {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${currentConfig.apiBaseUrl}${normalizedPath}`;
  return url;
}

// Test connection to the LiteLLM health endpoint
export async function testConnection(): Promise<boolean> {
  try {
    const healthUrl = getApiUrl('/health');
    const headers = getHeaders();
    
    console.log('Testing connection to:', healthUrl);
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers,
      cache: 'no-store' // Avoid cached responses
    });
    
    if (!response.ok) {
      console.error(`Health check failed with status: ${response.status}`);
      return false;
    }
    
    const healthData = await response.json();
    console.log('Health check response:', healthData);
    return true;
  } catch (error) {
    console.error('Health check error:', error);
    return false;
  }
}
