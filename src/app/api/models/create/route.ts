// src/app/api/models/create/route.ts

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
    
    // Create an array of LiteLLM bodies, one for each model
    const litellmBodies = modelData.models.map(model => ({
      model_name: model,
      litellm_params: {
        custom_llm_provider: modelData.provider,
        model: model,
        api_base: modelData.api_base,
        api_key: modelData.api_key,
        api_version: modelData.api_version,
        timeout: modelData.timeout ? Number(modelData.timeout) : undefined,
        stream_timeout: modelData.stream_timeout ? Number(modelData.stream_timeout) : undefined,
        max_retries: modelData.max_retries ? Number(modelData.max_retries) : undefined,
        input_cost_per_token: modelData.input_cost_per_token ? Number(modelData.input_cost_per_token) : undefined,
        output_cost_per_token: modelData.output_cost_per_token ? Number(modelData.output_cost_per_token) : undefined,
        rpm_limit: modelData.rpm_limit ? Number(modelData.rpm_limit) : undefined,
        tpm_limit: modelData.tpm_limit ? Number(modelData.tpm_limit) : undefined,
        organization: modelData.organization,
        use_in_pass_through: modelData.use_in_pass_through,
        merge_reasoning_content_in_choices: modelData.merge_reasoning_content_in_choices
      },
      model_info: {
        id: model,
        db_model: false,
        base_model: modelData.base_model,
        tier: modelData.tier,
        team_id: modelData.team_id,
        team_public_model_name: modelData.display_name || model
      }
    }));

    const url = getApiUrl('/model/new');

    // Log request details (excluding sensitive data)
    console.log('Request Details:');
    console.log('URL:', url);
    console.log('Headers:', {
      ...headers,
      Authorization: 'Bearer [REDACTED]'
    });
    console.log('Bodies:', litellmBodies);

    // Make the requests
    const responses = await Promise.all(litellmBodies.map(body => 
      fetch(url, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
    ));

    // Process all responses
    const results = await Promise.all(responses.map(async (response, index) => {
      const responseText = await response.text();
      
      if (!response.ok) {
        console.error(`Error Response for ${litellmBodies[index].model_name}:`, responseText);
        return { model: litellmBodies[index].model_name, error: `Failed to create model: ${responseText}` };
      }

      try {
        const rawData = JSON.parse(responseText);
        console.log(`\nParsed Response for ${litellmBodies[index].model_name}:`, JSON.stringify(rawData, null, 2));
        return { model: litellmBodies[index].model_name, data: rawData };
      } catch (e) {
        console.error(`Failed to parse response for ${litellmBodies[index].model_name}:`, e);
        return { model: litellmBodies[index].model_name, error: 'Invalid JSON response from server' };
      }
    }));

    console.log('=== Models Created ===\n');
    return NextResponse.json({ results });
  } catch (error) {
    console.error('\nError in models create API route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create models',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}