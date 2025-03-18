import { NextResponse } from 'next/server';
import { Model } from '@/types/models';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const return_wildcard_routes = searchParams.get('return_wildcard_routes') === 'true';
  console.log('\n=== Fetching Models ===');
  
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

    // Build URL with query parameters
    const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    const url = `${baseUrl}/v1/models${return_wildcard_routes ? '?return_wildcard_routes=true' : ''}`;

    // Log request details (excluding sensitive data)
    console.log('Request Details:');
    console.log('URL:', url);
    console.log('Headers:', {
      ...headers,
      Authorization: 'Bearer [REDACTED]'
    });

    // Make the request
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
      next: { revalidate: 0 }
    });

    // Log response details
    console.log('\nResponse Details:');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('Error Response:', responseText);
      throw new Error(`Failed to fetch models: ${responseText}`);
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

    // Helper function to determine provider from model id and owned_by
    const determineProvider = (id: string, ownedBy: string): string => {
      const lowerCaseId = id.toLowerCase();
      const lowerCaseOwnedBy = ownedBy.toLowerCase();
      
      if (lowerCaseOwnedBy.includes('anthropic') || lowerCaseId.includes('claude')) return 'anthropic';
      if (lowerCaseOwnedBy.includes('google') || lowerCaseId.includes('gemini')) return 'google';
      if (lowerCaseOwnedBy.includes('cohere') || lowerCaseId.includes('command')) return 'cohere';
      if (lowerCaseOwnedBy.includes('azure')) return 'azure';
      if (lowerCaseOwnedBy.includes('mistral') || lowerCaseId.includes('mistral')) return 'mistral';
      return 'openai'; // default to openai
    };

    // Transform the response to match our frontend format while preserving original data
    const transformedModels = {
      data: rawData.data.map((model: any) => {
        const provider = determineProvider(model.id, model.owned_by || '');
        return {
          model_id: model.id,
          provider: provider,
          display_name: model.id,
          is_active: true,
          // Preserve original model data
          owned_by: model.owned_by,
          permission: model.permission,
          pricing: model.pricing,
          context_length: model.context_length,
          // Add any additional fields from the original response
          ...model
        };
      })
    };

    console.log('=== Models Fetched Successfully ===\n');
    console.log('Transformed Models:', JSON.stringify(transformedModels, null, 2));
    return NextResponse.json(transformedModels);
  } catch (error) {
    console.error('\nError in models API route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch models',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
