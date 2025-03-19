import { NextResponse } from 'next/server';
import { getHeaders, getApiUrl } from '@/lib/config';
import { UserRequest, UserResponse } from '@/types/users';
import { validateUserData } from '@/lib/validators';

export async function POST(request: Request) {
  console.log('\n=== Updating User ===');
  
  try {
    // Verify we have the API key
    const headers = getHeaders();
    if (!headers.Authorization) {
      throw new Error('API key not configured');
    }

    // Get request body and transform to match OpenAPI schema
    const userData = await request.json();
    const validationError = validateUserData(userData);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }
    
    const url = getApiUrl('/user/update');

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