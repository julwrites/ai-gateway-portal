// src/app/api/users/delete/route.ts

import { NextResponse } from 'next/server';
import { getHeaders, getApiUrl } from '@/lib/config';

export async function POST(request: Request) {
  console.log('\n=== Deleting User ===');
  
  try {
    const headers = getHeaders();
    if (!headers.Authorization) {
      throw new Error('API key not configured');
    }

    const userData = await request.json();
    
    // Ensure user_ids is always an array
    const user_ids = Array.isArray(userData.user_ids) ? userData.user_ids : [userData.user_ids];

    const litellmBody = { user_ids };

    const url = getApiUrl('/user/delete');

    console.log('Request Details:');
    console.log('URL:', url);
    console.log('Headers:', {
      ...headers,
      Authorization: 'Bearer [REDACTED]'
    });
    console.log('Body:', litellmBody);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(litellmBody),
    });

    console.log('\nResponse Details:');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('Error Response:', responseText);
      throw new Error(`Failed to delete user: ${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('\nParsed Response:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Failed to parse response:', e);
      throw new Error('Invalid JSON response from server');
    }

    console.log('=== User Deleted Successfully ===\n');
    return NextResponse.json(data);
  } catch (error) {
    console.error('\nError in user delete route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete user',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}