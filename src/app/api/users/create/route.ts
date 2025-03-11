import { NextResponse } from 'next/server';
import { User } from '@/types/users';
import { getHeaders, getApiUrl } from '@/lib/config';

export async function POST(request: Request) {
  console.log('\n=== Creating User ===');
  
  try {
    // Verify we have the API key
    const headers = getHeaders();
    if (!headers.Authorization) {
      throw new Error('API key not configured');
    }

    // Get request body and transform to match OpenAPI schema
    const userData = await request.json();
    
    // Transform frontend user data to match OpenAPI schema
    const litellmBody = {
      user_id: userData.user_id,
      user_email: userData.user_email,
      user_role: userData.user_role,
      teams: userData.teams,
      max_budget: userData.max_budget ? Number(userData.max_budget) : undefined,
      budget_duration: userData.budget_duration,
      models: userData.models || [],
      tpm_limit: userData.tpm_limit ? Number(userData.tpm_limit) : undefined,
      rpm_limit: userData.rpm_limit ? Number(userData.rpm_limit) : undefined,
      budget_id: userData.budget_id,
      allowed_cache_controls: userData.allowed_cache_controls,
      blocked: userData.blocked || false,
      metadata: userData.metadata,
      max_parallel_requests: userData.max_parallel_requests ? Number(userData.max_parallel_requests) : undefined,
      soft_budget: userData.soft_budget ? Number(userData.soft_budget) : undefined,
      model_max_budget: userData.model_max_budget,
      model_rpm_limit: userData.model_rpm_limit,
      model_tpm_limit: userData.model_tpm_limit,
      user_alias: userData.user_alias,
      auto_create_key: userData.auto_create_key !== false, // default to true
      send_invite_email: userData.send_invite_email
    };

    const url = getApiUrl('/user/new');

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
      throw new Error(`Failed to create user: ${responseText}`);
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

    console.log('=== User Created Successfully ===\n');
    // Transform response to match OpenAPI schema
    const transformedUser = {
      key: data.key,
      expires: data.expires,
      user_id: data.user_id,
      user_email: data.user_email,
      user_role: data.user_role,
      teams: data.teams || [],
      max_budget: data.max_budget,
      budget_duration: data.budget_duration,
      models: data.models || [],
      tpm_limit: data.tpm_limit,
      rpm_limit: data.rpm_limit,
      budget_id: data.budget_id,
      allowed_cache_controls: data.allowed_cache_controls,
      blocked: data.blocked || false,
      metadata: data.metadata,
      max_parallel_requests: data.max_parallel_requests,
      soft_budget: data.soft_budget,
      model_max_budget: data.model_max_budget,
      model_rpm_limit: data.model_rpm_limit,
      model_tpm_limit: data.model_tpm_limit,
      user_alias: data.user_alias
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error('\nError in user create route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create user',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
