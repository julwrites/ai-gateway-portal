import { NextResponse } from 'next/server';
import { UserRequest, UserResponse } from '@/types/users';
import { getHeaders, getApiUrl } from '@/lib/config';

export async function POST(request: Request) {
  console.log('\n=== Creating User ===');
  
  try {
    // Verify we have the API key
    const headers = getHeaders();
    if (!headers.Authorization) {
      throw new Error('API key not configured');
    }

    // Get request body and transform to match OpenAPI schema
    const userData: UserRequest = await request.json();
    
    const url = getApiUrl('/user/new');

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