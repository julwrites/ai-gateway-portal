import { NextResponse } from 'next/server';
import { APIKey } from '@/types/keys';
import { getHeaders, getApiUrl } from '@/lib/config';

export async function POST(request: Request) {
  console.log('\n=== Creating API Key ===');
  
  try {
    // Verify we have the API key
    const headers = getHeaders();
    if (!headers.Authorization) {
      throw new Error('API key not configured');
    }

    // Get request body and transform to match OpenAPI schema
    const keyData = await request.json();
    
    // Transform frontend key data to match OpenAPI schema
    const litellmBody = {
      key_alias: keyData.key_alias,
      duration: keyData.duration,
      models: keyData.models || [],
      spend: keyData.spend ? Number(keyData.spend) : 0,
      max_budget: keyData.max_budget ? Number(keyData.max_budget) : undefined,
      user_id: keyData.user_id,
      team_id: keyData.team_id,
      max_parallel_requests: keyData.max_parallel_requests ? Number(keyData.max_parallel_requests) : undefined,
      metadata: keyData.metadata || {},
      tpm_limit: keyData.tpm_limit ? Number(keyData.tpm_limit) : undefined,
      rpm_limit: keyData.rpm_limit ? Number(keyData.rpm_limit) : undefined,
      budget_duration: keyData.budget_duration,
      allowed_cache_controls: keyData.allowed_cache_controls || [],
      config: keyData.config || {},
      permissions: keyData.permissions || {},
      model_max_budget: keyData.model_max_budget || {},
      model_rpm_limit: keyData.model_rpm_limit,
      model_tpm_limit: keyData.model_tpm_limit,
      guardrails: keyData.guardrails,
      blocked: keyData.blocked || false,
      aliases: keyData.aliases || {},
      budget_id: keyData.budget_id,
      tags: keyData.tags,
      enforced_params: keyData.enforced_params,
      soft_budget: keyData.soft_budget ? Number(keyData.soft_budget) : undefined,
      send_invite_email: keyData.send_invite_email
    };

    const url = getApiUrl('/key/generate');

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
      throw new Error(`Failed to create API key: ${responseText}`);
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

    console.log('=== API Key Created Successfully ===\n');
    // Transform response to match OpenAPI schema
    const transformedKey = {
      key: data.key,
      expires: data.expires,
      key_alias: data.key_alias,
      models: data.models || [],
      spend: data.spend || 0,
      max_budget: data.max_budget,
      user_id: data.user_id,
      team_id: data.team_id,
      max_parallel_requests: data.max_parallel_requests,
      metadata: data.metadata || {},
      tpm_limit: data.tpm_limit,
      rpm_limit: data.rpm_limit,
      budget_duration: data.budget_duration,
      allowed_cache_controls: data.allowed_cache_controls || [],
      config: data.config || {},
      permissions: data.permissions || {},
      model_max_budget: data.model_max_budget || {},
      model_rpm_limit: data.model_rpm_limit,
      model_tpm_limit: data.model_tpm_limit,
      guardrails: data.guardrails,
      blocked: data.blocked || false,
      aliases: data.aliases || {},
      budget_id: data.budget_id,
      tags: data.tags,
      enforced_params: data.enforced_params,
      soft_budget: data.soft_budget
    };

    return NextResponse.json(transformedKey);
  } catch (error) {
    console.error('\nError in API key create route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create API key',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
