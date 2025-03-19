import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('\n=== Adding Team Member ===');
  
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

    // Get request body
    const requestData = await request.json();
    console.log('Received request data:', JSON.stringify(requestData, null, 2));
    
    // Check if team_id and member exist
    if (!requestData.team_id) {
      console.error('Missing team_id in request body');
      return NextResponse.json({ error: 'Missing team_id in request body' }, { status: 400 });
    }
    
    if (!requestData.member) {
      console.error('Missing member in request body');
      return NextResponse.json({ error: 'Missing member in request body' }, { status: 400 });
    }
    
    // Build URL
    const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    const url = `${baseUrl}/team/member_add`;

    // Log request details (excluding sensitive data)
    console.log('Request Details:');
    console.log('URL:', url);
    console.log('Headers:', {
      ...headers,
      Authorization: 'Bearer [REDACTED]'
    });
    console.log('Body being sent to API:', JSON.stringify(requestData, null, 2));

    // Make the request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    // Log response details
    console.log('\nResponse Details:');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);

    const responseText = await response.text();
    console.log('\nResponse text:', responseText);
    
    if (!response.ok) {
      console.error('Error Response:', responseText);
      throw new Error(`Failed to add team member: ${responseText}`);
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

    console.log('=== Team Member Added Successfully ===\n');
    return NextResponse.json(data);
  } catch (error) {
    console.error('\nError in team member add route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to add team member',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
