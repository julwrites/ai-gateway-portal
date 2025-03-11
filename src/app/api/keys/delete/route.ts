import { NextResponse } from 'next/server';
import { APIKey } from '@/types/keys';
import { getHeaders, getApiUrl } from '@/lib/config';

export async function POST(request: Request) {
  console.log('\n=== Deleting API Key ===');
  
  try {
    // Verify we have the API key
    const headers = getHeaders();
    if (!headers.Authorization) {
      throw new Error('API key not configured');
    }

    // Get request body and transform to match OpenAPI schema
    const keyData = await request.json();
    
    // Transform frontend key data to match OpenAPI schema
    const litellmBody = {
      keys: Array.isArray(keyData.keys) ? keyData.keys : undefined,
      key_aliases: Array.isArray(keyData.key_aliases) ? keyData.key_aliases : undefined
    };

    // Validate that either keys or key_aliases is provided
    if (!litellmBody.keys && !litellmBody.key_aliases) {
      throw new Error('Either keys or key_aliases must be provided');
    }

    const url = getApiUrl('/key/delete');

    // Log request details (excluding sensitive data)
    console.log('Request Details:');
    console.log('URL:', url);
    console.log('Headers:', {
      ...headers,
      Authorization: 'Bearer [REDACTED]'
    });
    console.log('Body:', litellmBody);

    // Make the request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(litellmBody),
    });

    // Log response details
    console.log('\nResponse Details:');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('Error Response:', responseText);
      throw new Error(`Failed to delete API key: ${responseText}`);
    }

    // Parse and validate response
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('\nParsed Response:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Failed to parse response:', e);
      throw new Error('Invalid JSON response from server');
    }

    console.log('=== API Key Deleted Successfully ===\n');
    return NextResponse.json(data);
  } catch (error) {
    console.error('\nError in API key delete route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete API key',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
