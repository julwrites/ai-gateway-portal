import { useConfig } from './config-context';

interface Config {
  apiBaseUrl: string;
  apiKey: string;
}

// Create a function to get the current config values
export function getConfig(): Config {
  try {
    // For server components, we still fallback to env vars if available
    if (typeof window === 'undefined') {
      return {
        apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000',
        apiKey: process.env.LITELLM_API_KEY || '',
      };
    }
    
    // For client components, we get values from localStorage
    const apiBaseUrl = localStorage.getItem('apiBaseUrl') || 'http://localhost:4000';
    const apiKey = localStorage.getItem('apiKey') || '';
    
    console.log('Config retrieved from localStorage:', {
      baseUrl: apiBaseUrl,
      keyExists: !!apiKey
    });
    
    return { apiBaseUrl, apiKey };
  } catch (error) {
    console.error('Error getting config:', error);
    // Fallback to defaults if there's an error
    return {
      apiBaseUrl: 'http://localhost:4000',
      apiKey: '',
    };
  }
}

// We create a singleton for easy access without the hook
// This gets initialized on import
let configSingleton: Config;

try {
  configSingleton = getConfig();
} catch (e) {
  console.error('Error initializing config singleton:', e);
  configSingleton = {
    apiBaseUrl: 'http://localhost:4000',
    apiKey: '',
  };
}

export const config = configSingleton;

// Log configuration on load (excluding sensitive data)
if (typeof window !== 'undefined') {
  console.log('Config initialized with API Base URL:', config.apiBaseUrl);
  console.log('API Key configured:', !!config.apiKey);
}

export function getHeaders() {
  // Get a fresh configuration each time to ensure we have the latest values
  const { apiKey } = getConfig();
  
  if (!apiKey) {
    console.warn('No API key configured');
  }
  
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}

export function getApiUrl(path: string) {
  // Get a fresh configuration each time to ensure we have the latest values
  const { apiBaseUrl } = getConfig();
  
  // Log constructed URL for debugging
  console.log('Building API URL with base:', apiBaseUrl);
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${apiBaseUrl}${normalizedPath}`;
  
  console.log('Final API URL:', url);
  return url;
}
