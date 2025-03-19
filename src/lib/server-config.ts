import { cookies } from 'next/headers';

// This export is needed because we use cookies
export const dynamic = 'force-dynamic';

/**
 * Gets the API configuration from HTTP-only cookies
 * This function should only be used in server components or API routes
 */
export function getServerConfig() {
  const cookieStore = cookies();
  const apiBaseUrl = cookieStore.get('api-base-url')?.value;
  const apiKey = cookieStore.get('api-key')?.value;
  
  return {
    apiBaseUrl,
    apiKey,
    isConfigured: !!(apiBaseUrl && apiKey)
  };
}
