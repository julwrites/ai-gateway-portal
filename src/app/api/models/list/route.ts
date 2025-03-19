import { NextResponse } from 'next/server';
import { Model } from '@/types/models';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const return_wildcard_routes = searchParams.get('return_wildcard_routes') === 'true';
  // Get the referer to see where the request is coming from
  const referer = request.headers.get('referer');
  console.log('\n=== Fetching Models ===');
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
      return NextResponse.json({ data: [] });
    }
    
    if (!apiBaseUrl) {
      console.log('API base URL not configured, returning empty array');
      return NextResponse.json({ data: [] });
    }
    
    // Create headers for external API
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Build URL with query parameters
    const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    const modelsUrl = `${baseUrl}/v1/models${return_wildcard_routes ? '?return_wildcard_routes=true' : ''}`;
    const modelGroupInfoUrl = `${baseUrl}/model_group/info`;

    // Log request details (excluding sensitive data)
    console.log('Request Details:');
    console.log('Models URL:', modelsUrl);
    console.log('Model Group Info URL:', modelGroupInfoUrl);
    console.log('Headers:', {
      ...headers,
      Authorization: 'Bearer [REDACTED]'
    });

    // Make the requests in parallel
    const [modelsResponse, modelGroupInfoResponse] = await Promise.all([
      fetch(modelsUrl, {
        method: 'GET',
        headers: headers,
        next: { revalidate: 0 }
      }),
      fetch(modelGroupInfoUrl, {
        method: 'GET',
        headers: headers,
        next: { revalidate: 0 }
      })
    ]);

    // Log response details
    console.log('\nModels Response Details:');
    console.log('Status:', modelsResponse.status);
    console.log('Headers:', modelsResponse.headers);

    console.log('\nModel Group Info Response Details:');
    console.log('Status:', modelGroupInfoResponse.status);
    console.log('Headers:', modelGroupInfoResponse.headers);

    const modelsResponseText = await modelsResponse.text();
    
    if (!modelsResponse.ok) {
      console.error('Error Response from /v1/models:', modelsResponseText);
      throw new Error(`Failed to fetch models: ${modelsResponseText}`);
    }

    // Parse and validate models response
    let modelsData;
    try {
      modelsData = JSON.parse(modelsResponseText);
      console.log('\nParsed Models Response:', JSON.stringify(modelsData, null, 2));
    } catch (e) {
      console.error('Failed to parse models response:', e);
      throw new Error('Invalid JSON response from server for models');
    }

    // Parse and validate model group info response if successful
    let modelGroupInfoData = { data: [] };
    if (modelGroupInfoResponse.ok) {
      try {
        const modelGroupInfoResponseText = await modelGroupInfoResponse.text();
        modelGroupInfoData = JSON.parse(modelGroupInfoResponseText);
        console.log('\nParsed Model Group Info Response:', JSON.stringify(modelGroupInfoData, null, 2));
      } catch (e) {
        console.error('Failed to parse model group info response:', e);
        console.warn('Continuing with limited model information');
      }
    } else {
      console.warn('Model group info request failed, continuing with limited model information');
      console.warn('Status:', modelGroupInfoResponse.status);
      try {
        const errorText = await modelGroupInfoResponse.text();
        console.warn('Error:', errorText);
      } catch (e) {
        console.warn('Could not read error response');
      }
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

    // Create a map of model group info for quick lookup
    const modelGroupInfoMap = new Map();
    if (modelGroupInfoData && modelGroupInfoData.data) {
      modelGroupInfoData.data.forEach((modelInfo: any) => {
        modelGroupInfoMap.set(modelInfo.model_group, modelInfo);
      });
    }

    // Transform the response to match our frontend format while preserving original data
    const transformedModels = {
      data: modelsData.data.map((model: any) => {
        const provider = determineProvider(model.id, model.owned_by || '');
        const modelId = model.id;
        
        // Look for matching model info in the model group info data
        const modelInfo = modelGroupInfoMap.get(modelId);
        
        return {
          model_id: modelId,
          provider: provider,
          display_name: modelId,
          is_active: true,
          // Add token limits and pricing from model group info if available
          max_tokens: model.context_length || (modelInfo ? (modelInfo.max_input_tokens || 0) + (modelInfo.max_output_tokens || 0) : undefined),
          input_cost_per_token: modelInfo ? modelInfo.input_cost_per_token : undefined,
          output_cost_per_token: modelInfo ? modelInfo.output_cost_per_token : undefined,
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
