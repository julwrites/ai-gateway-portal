import { NextResponse } from 'next/server';
import { APIKey } from '@/types/keys';
import { getHeaders, getApiUrl } from '@/lib/config';

// Remove dynamic directive for static export
// export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  console.log('\n=== Fetching API Keys ===');
  
  try {
    // Verify we have the API key
    const headers = getHeaders();
    if (!headers.Authorization) {
      throw new Error('API key not configured');
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const size = searchParams.get('size') || '10';
    // ... (keep other query parameters)

    // Build URL with query parameters
    let url = getApiUrl('/key/list');
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    // ... (append other query parameters)
    url += `?${params.toString()}`;

    // Make the initial request to /key/list
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch API keys: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('\nParsed Response from /key/list:', JSON.stringify(data, null, 2));

    // Fetch detailed information for each key
    const detailedKeys = await Promise.all(data.keys.map(async (key: string) => {
      const keyInfoUrl = getApiUrl(`/key/info?key=${encodeURIComponent(key)}`);
      try {
        const keyInfoResponse = await fetch(keyInfoUrl, {
          method: 'GET',
          headers: headers,
          next: { revalidate: 0 }
        });
    
        if (!keyInfoResponse.ok) {
          console.error(`Failed to fetch info for key ${key}: ${keyInfoResponse.statusText}`);
          return { key }; // Return basic info if fetch fails
        }
    
        const keyInfo = (await keyInfoResponse.json()).info;
        console.log(`Detailed info for key ${key}:`, JSON.stringify(keyInfo, null, 2));

        // Return the detailed key info
        return {
          id: key,
          key: keyInfo.key_name,
          key_alias: keyInfo.key_alias,
          spend: keyInfo.spend || 0,
          max_budget: keyInfo.max_budget,
          expires: keyInfo.expires,
          models: keyInfo.models || [],
          aliases: keyInfo.aliases || {},
          user_id: keyInfo.user_id,
          team_id: keyInfo.team_id,
          permissions: keyInfo.permissions || {},
          max_parallel_requests: keyInfo.max_parallel_requests,
          tpm_limit: keyInfo.tpm_limit,
          rpm_limit: keyInfo.rpm_limit,
          budget_duration: keyInfo.budget_duration,
          created_at: keyInfo.created_at,
          updated_at: keyInfo.updated_at
        };
      } catch (error) {
        console.error(`Error fetching info for key ${key}:`, error);
        return { key }; // Return basic info if there's an error
      }
    }));

    console.log("Detailed keys: ", detailedKeys);

    // Transform response to match OpenAPI schema
    const transformedResponse = {
      keys: detailedKeys,
      total_count: data.total_count,
      current_page: Number(page),
      total_pages: data.total_pages
    };

    console.log('Transformed response:', JSON.stringify(transformedResponse, null, 2));

    return NextResponse.json(transformedResponse);
  } catch (error) {
    console.error('\nError in API keys route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch API keys',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
