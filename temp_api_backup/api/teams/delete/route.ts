import { NextResponse } from 'next/server';
import { Team } from '@/types/teams';

export async function POST(request: Request) {
  console.log('\n=== Deleting Team ===');
  
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
    const teamData = await request.json();
    
    // Transform frontend team data to match OpenAPI schema
    const litellmBody = {
      team_ids: Array.isArray(teamData.team_ids) 
        ? teamData.team_ids 
        : teamData.team_id 
          ? [teamData.team_id]
          : []
    };
    
    // Build URL
    const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    const url = `${baseUrl}/team/delete`;

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
      throw new Error(`Failed to delete team: ${responseText}`);
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

    console.log('=== Team Deleted Successfully ===\n');
    return NextResponse.json(data);
  } catch (error) {
    console.error('\nError in team delete route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete team',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
