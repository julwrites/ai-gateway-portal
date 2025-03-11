import { NextResponse } from 'next/server';
import { Model } from '@/types/models';
import { getHeaders, getApiUrl } from '@/lib/config';

export async function POST(request: Request) {
  console.log('\n=== Creating Model ===');
  
  try {
    // Verify we have the API key
    const headers = getHeaders();
    if (!headers.Authorization) {
      throw new Error('API key not configured');
    }

    // Get request body and transform to LiteLLM format
    const modelData = await request.json();
    
    // Transform frontend model data to match OpenAPI schema for model creation
    const litellmBody = {
      model_name: modelData.model_name,
      litellm_params: {
        custom_llm_provider: modelData.litellm_params?.custom_llm_provider,
        model: modelData.litellm_params?.model,
        api_base: modelData.litellm_params?.api_base,
        api_key: modelData.litellm_params?.api_key,
        api_version: modelData.litellm_params?.api_version,
        timeout: modelData.litellm_params?.timeout ? Number(modelData.litellm_params.timeout) : undefined,
        stream_timeout: modelData.litellm_params?.stream_timeout ? Number(modelData.litellm_params.stream_timeout) : undefined,
        max_retries: modelData.litellm_params?.max_retries ? Number(modelData.litellm_params.max_retries) : undefined,
        input_cost_per_token: modelData.litellm_params?.input_cost_per_token ? Number(modelData.litellm_params.input_cost_per_token) : undefined,
        output_cost_per_token: modelData.litellm_params?.output_cost_per_token ? Number(modelData.litellm_params.output_cost_per_token) : undefined,
        rpm_limit: modelData.litellm_params?.rpm_limit ? Number(modelData.litellm_params.rpm_limit) : undefined,
        tpm_limit: modelData.litellm_params?.tpm_limit ? Number(modelData.litellm_params.tpm_limit) : undefined,
        organization: modelData.litellm_params?.organization,
        use_in_pass_through: modelData.litellm_params?.use_in_pass_through,
        merge_reasoning_content_in_choices: modelData.litellm_params?.merge_reasoning_content_in_choices
      },
      model_info: {
        id: modelData.model_info?.id,
        db_model: modelData.model_info?.db_model || false,
        base_model: modelData.model_info?.base_model,
        tier: modelData.model_info?.tier,
        team_id: modelData.model_info?.team_id,
        team_public_model_name: modelData.model_info?.team_public_model_name
      }
    };

    const url = getApiUrl('/model/new');

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
      throw new Error(`Failed to create model: ${responseText}`);
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

    console.log('=== Model Created Successfully ===\n');
    return NextResponse.json(rawData);
  } catch (error) {
    console.error('\nError in models create API route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create model',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
