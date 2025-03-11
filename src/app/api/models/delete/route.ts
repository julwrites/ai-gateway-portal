import { NextResponse } from 'next/server';
import { Model } from '@/types/models';
import { getHeaders, getApiUrl } from '@/lib/config';

export async function POST(request: Request) {
  console.log('\n=== Deleting Model ===');
  
  try {
    // Verify we have the API key
    const headers = getHeaders();
    if (!headers.Authorization) {
      throw new Error('API key not configured');
    }

    // Get request body and transform to LiteLLM format
    const { model_id } = await request.json();
    
    // Transform frontend model ID to match OpenAPI schema
    const litellmBody = {
      id: model_id
    };

    const url = getApiUrl('/model/delete');

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
      throw new Error(`Failed to delete model: ${responseText}`);
    }

    // Parse and validate response
    let rawData;
    try {
      rawData = JSON.parse(responseText);
      console.log('\nParsed Response:', JSON.stringify(rawData, null, 2));
    } catch (e) {
      console.error('Failed to parse response:', e);
      throw new Error('Invalid JSON response from server');
    }

    console.log('=== Model Deleted Successfully ===\n');
    // Return response matching OpenAPI schema
    return NextResponse.json(rawData);
  } catch (error) {
    console.error('\nError in models delete API route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete model',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
