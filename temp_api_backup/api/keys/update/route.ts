import { NextResponse } from 'next/server';
import { APIKey } from '@/types/keys';
import { getHeaders, getApiUrl } from '@/lib/config';
import { isValidDuration } from '@/lib/validators';

export async function POST(request: Request) {
  console.log('\n=== Updating API Key ===');
  
  try {
    const headers = getHeaders();
    if (!headers.Authorization) {
      throw new Error('API key not configured');
    }

    const keyData = await request.json();

    // Validate budget_duration
    if (keyData.budget_duration && !isValidDuration(keyData.budget_duration)) {
      return NextResponse.json(
        { error: 'Invalid budget duration format' },
        { status: 400 }
      );
    }

    const litellmBody = {
      key: keyData.id, // Use the key's ID instead of the key itself
      key_alias: keyData.key_alias,
      duration: keyData.duration,
      models: keyData.models || [],
      spend: keyData.spend ? Number(keyData.spend) : undefined,
      max_budget: keyData.max_budget ? Number(keyData.max_budget) : undefined,
      user_id: keyData.user_id,
      team_id: keyData.team_id,
      max_parallel_requests: keyData.max_parallel_requests ? Number(keyData.max_parallel_requests) : undefined,
      metadata: keyData.metadata || {},
      tpm_limit: keyData.tpm_limit ? Number(keyData.tpm_limit) : undefined,
      rpm_limit: keyData.rpm_limit ? Number(keyData.rpm_limit) : undefined,
      budget_duration: keyData.budget_duration,
      allowed_cache_controls: keyData.allowed_cache_controls || [],
      permissions: keyData.permissions || {},
      model_max_budget: keyData.model_max_budget || {},
      model_rpm_limit: keyData.model_rpm_limit,
      model_tpm_limit: keyData.model_tpm_limit,
      guardrails: keyData.guardrails,
      blocked: keyData.blocked || false,
      aliases: keyData.aliases || {},
      tags: keyData.tags,
      soft_budget: keyData.soft_budget ? Number(keyData.soft_budget) : undefined,
    };

    const url = getApiUrl('/key/update');

    console.log('Request Details:', { url, body: litellmBody });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(litellmBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error Response:', errorText);
      throw new Error(`Failed to update API key: ${errorText}`);
    }

    const data = await response.json();
    console.log('API Key Updated Successfully:', data);

    const transformedKey: APIKey = {
      id: data.id,
      key: data.key,
      key_alias: data.key_alias,
      spend: data.spend || 0,
      max_budget: data.max_budget,
      expires: data.expires,
      models: data.models || [],
      aliases: data.aliases || {},
      user_id: data.user_id,
      team_id: data.team_id,
      permissions: data.permissions || {},
      max_parallel_requests: data.max_parallel_requests,
      tpm_limit: data.tpm_limit,
      rpm_limit: data.rpm_limit,
      budget_duration: data.budget_duration,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return NextResponse.json(transformedKey);
  } catch (error) {
    console.error('Error in API key update route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update API key',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}