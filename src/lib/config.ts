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
      console.log('[getConfig] Running on server, using env vars');
      const config = {
        apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000',
        apiKey: process.env.LITELLM_API_KEY || '',
      };
      console.log('[getConfig] Server config:', { 
        baseUrl: config.apiBaseUrl, 
        keyExists: !!config.apiKey 
      });
      return config;
    }
    
    // For client components, we get values from localStorage
    console.log('[getConfig] Running on client, checking localStorage');
    
    // Dump all localStorage keys for debugging
    console.log('[getConfig] All localStorage keys:', Object.keys(localStorage));
    
    const apiBaseUrl = localStorage.getItem('apiBaseUrl');
    const apiKey = localStorage.getItem('apiKey');
    
    console.log('[getConfig] Raw localStorage values:', {
      apiBaseUrl: apiBaseUrl || '(not set)',
      apiKeyExists: !!apiKey
    });
    
    // Use defaults if values are not found
    const finalBaseUrl = apiBaseUrl || 'http://localhost:4000';
    const finalApiKey = apiKey || '';
    
    console.log('[getConfig] Final config values:', {
      baseUrl: finalBaseUrl,
      keyExists: !!finalApiKey,
      keyLength: finalApiKey ? finalApiKey.length : 0
    });
    
    return { 
      apiBaseUrl: finalBaseUrl, 
      apiKey: finalApiKey 
    };
  } catch (error) {
    console.error('[getConfig] Error getting config:', error);
    // Fallback to defaults if there's an error
    return {
      apiBaseUrl: 'http://localhost:4000',
      apiKey: '',
    };
  }
}

// Instead of a singleton, we'll always get fresh values
// Log configuration on load (excluding sensitive data)
if (typeof window !== 'undefined') {
  const initialConfig = getConfig();
  console.log('Config initialized with API Base URL:', initialConfig.apiBaseUrl);
  console.log('API Key configured:', !!initialConfig.apiKey);
}

export function getHeaders() {
  console.log('[getHeaders] Getting headers for API request');
  
  // Get a fresh configuration each time to ensure we have the latest values
  const { apiKey } = getConfig();
  
  if (!apiKey) {
    console.warn('[getHeaders] WARNING: No API key configured');
  } else {
    console.log('[getHeaders] API key found, length:', apiKey.length);
  }
  
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  console.log('[getHeaders] Generated headers:', {
    ...headers,
    'Authorization': apiKey ? 'Bearer [REDACTED]' : 'Bearer '
  });
  
  return headers;
}

export function getApiUrl(path: string) {
  console.log('[getApiUrl] Building URL for path:', path);
  
  // Get a fresh configuration each time to ensure we have the latest values
  const { apiBaseUrl } = getConfig();
  
  console.log('[getApiUrl] Using API base URL:', apiBaseUrl);
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${apiBaseUrl}${normalizedPath}`;
  
  console.log('[getApiUrl] Final API URL:', url);
  return url;
}
