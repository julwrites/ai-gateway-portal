import { NextResponse } from 'next/server';
import { UserRequest, UserResponse } from '@/types/users';
import { validateUserData } from '@/lib/validators';

export async function POST(request: Request) {
  console.log('\n=== Updating User ===');
  
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
    const userData = await request.json();
    const validationError = validateUserData(userData);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }
    
    // Build URL
    const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    const url = `${baseUrl}/user/update`;

    // Make the request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user: ${await response.text()}`);
    }

    const updatedUser: UserResponse = await response.json();
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('\nError in user update route:', error);
    return NextResponse.json(
      { error: 'Failed to update user', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
