import { NextResponse } from 'next/server';
import { getHeaders, getApiUrl } from '@/lib/config';

export async function GET() {
  console.log('\n=== Debug Information ===');
  console.log('Node Environment:', process.env.NODE_ENV);
  console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
  console.log('API Key Present:', !!process.env.LITELLM_API_KEY);
  console.log('======================');

  // Test connection to API server
  try {
    const url = getApiUrl('/health');
    const headers = getHeaders();

    console.log('\nTesting connection to API...');
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });

    console.log('Response Status:', response.status);
    
    const text = await response.text();
    console.log('Response Text:', text);
    
    try {
      // Try to parse as JSON for better logging
      const jsonResponse = JSON.parse(text);
      console.log('Parsed Response:', jsonResponse);
    } catch (e) {
      console.log('Response is not JSON');
    }
    
    console.log('======================');

    return NextResponse.json({
      environment: {
        nodeEnv: process.env.NODE_ENV,
        apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
        hasApiKey: !!process.env.LITELLM_API_KEY
      },
      litellm: {
        status: response.status,
        response: text,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Connection Error:', error);
    console.log('Error Details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    console.log('======================');
    
    return NextResponse.json({
      error: 'Failed to connect to API server',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
