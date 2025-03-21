// src/app/api/users/delete/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('\n=== Deleting User ===');
  
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

    const userData = await request.json();
    
    // Ensure user_ids is always an array
    const user_ids = Array.isArray(userData.user_ids) ? userData.user_ids : [userData.user_ids];

    const litellmBody = { user_ids };

    // Build URL
    const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    const url = `${baseUrl}/user/delete`;

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
