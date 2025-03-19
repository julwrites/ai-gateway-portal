import { NextResponse } from 'next/server';
import { UserRequest, UserResponse } from '@/types/users';

export async function POST(request: Request) {
  console.log('\n=== Creating User ===');
  
  try {
    // Get configuration from headers
    const apiBaseUrl = request.headers.get('X-API-Base-URL');
    const apiKey = request.headers.get('X-API-Key');
    
    console.log('API configuration from headers:', {
      baseUrl: apiBaseUrl,
      keyExists: !!apiKey
    });
    
    // Verify we have the API key
    if (!apiKey) {
      throw new Error('API key not configured');
    }
    
    if (!apiBaseUrl) {
      throw new Error('API base URL not configured');
    }
    
    // Create headers for external API
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Get request body and transform to match OpenAPI schema
    const userData: UserRequest = await request.json();
    
    // Build URL
    const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    const url = `${baseUrl}/user/new`;

    // Log request details (excluding sensitive data)
    console.log('Request Details:');
    console.log('URL:', url);
    console.log('Headers:', {
      ...headers,
      Authorization: 'Bearer [REDACTED]'
    });
    console.log('Body:', userData);

    // Make the request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    // Log response details
    console.log('\nResponse Details:');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);

    const responseData: UserResponse = await response.json();
    
    if (!response.ok) {
      console.error('Error Response:', responseData);
      throw new Error(`Failed to create user: ${(responseData as any).error || 'Unknown error'}`);
    }

    console.log('\nParsed Response:', JSON.stringify(responseData, null, 2));
    console.log('=== User Created Successfully ===\n');

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('\nError in user create route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create user',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
