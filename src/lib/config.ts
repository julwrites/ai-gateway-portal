interface Config {
  apiBaseUrl: string;
  apiKey: string;
}

export const config: Config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000',
  apiKey: process.env.LITELLM_API_KEY || '',
};

// Log configuration on load (excluding sensitive data)
console.log('API Base URL:', config.apiBaseUrl);
console.log('API Key configured:', !!config.apiKey);

export function getHeaders() {
  if (!config.apiKey) {
    console.warn('No API key configured');
  }
  
  return {
    'Authorization': `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}

export function getApiUrl(path: string) {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${config.apiBaseUrl}${normalizedPath}`;
  return url;
}
