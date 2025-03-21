import { NextResponse } from 'next/server';
import { Team } from '@/types/teams';

export const revalidate = 60; // Adjust as needed

export async function GET(request: Request) {
  // Get the referer to see where the request is coming from
  const referer = request.headers.get('referer');
  console.log('\n=== Fetching Teams ===');
  console.log('Request from:', referer || 'unknown');
  
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
      console.log('API key not configured, returning empty array');
      return NextResponse.json([]);
    }
    
    if (!apiBaseUrl) {
      console.log('API base URL not configured, returning empty array');
      return NextResponse.json([]);
    }
    
    // Create headers for external API
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Build URL
    const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    const url = `${baseUrl}/team/list`;

    console.log('Request Details:');
    console.log('URL:', url);
    console.log('Headers:', {
      ...headers,
      Authorization: 'Bearer [REDACTED]'
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    console.log('\nResponse Details:');
    console.log('Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error Response:', errorText);
      throw new Error(`Failed to fetch teams: ${response.statusText}`);
    }

    const teams: Team[] = await response.json();
    console.log('\nTeams Fetched:', teams.length);

    return NextResponse.json(teams);
  } catch (error) {
    console.error('\nError in teams API route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch teams',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
