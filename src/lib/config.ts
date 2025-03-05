interface Config {
  apiBaseUrl: string;
  apiKey: string;
}

export const config: Config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000',
  apiKey: process.env.LITELLM_API_KEY || '',
};

export function getHeaders() {
  return {
    'Authorization': `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json',
  };
}

export function getApiUrl(path: string) {
  return `${config.apiBaseUrl}${path}`;
}
