import { NextResponse } from 'next/server';
import { Team } from '@/types/teams';
import { getHeaders, getApiUrl } from '@/lib/config';

export async function POST(request: Request) {
  console.log('\n=== Creating Team ===');
  
  try {
    // Verify we have the API key
    const headers = getHeaders();
    if (!headers.Authorization) {
      throw new Error('API key not configured');
    }

    // Get request body and transform to match OpenAPI schema
    const teamData = await request.json();
    
    // Transform frontend team data to match OpenAPI schema
    const litellmBody = {
      team_alias: teamData.team_alias,
      team_id: teamData.team_id,
      organization_id: teamData.organization_id,
      members_with_roles: teamData.members_with_roles?.map((member: any) => ({
        role: member.role,
        user_id: member.user_id
      })),
      metadata: teamData.metadata,
      tpm_limit: teamData.tpm_limit ? Number(teamData.tpm_limit) : undefined,
      rpm_limit: teamData.rpm_limit ? Number(teamData.rpm_limit) : undefined,
      max_budget: teamData.max_budget ? Number(teamData.max_budget) : undefined,
      budget_duration: teamData.budget_duration,
      models: teamData.models || [],
      blocked: teamData.blocked || false,
      model_aliases: teamData.model_aliases,
      tags: teamData.tags,
      guardrails: teamData.guardrails
    };

    const url = getApiUrl('/team/new');

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
      throw new Error(`Failed to create team: ${responseText}`);
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

    console.log('=== Team Created Successfully ===\n');
    // Transform response to match OpenAPI schema
    const transformedTeam = {
      team_id: data.team_id,
      team_alias: data.team_alias,
      organization_id: data.organization_id,
      members_with_roles: data.members_with_roles || [],
      metadata: data.metadata,
      tpm_limit: data.tpm_limit,
      rpm_limit: data.rpm_limit,
      max_budget: data.max_budget,
      budget_duration: data.budget_duration,
      models: data.models || [],
      blocked: data.blocked || false,
      spend: data.spend || 0,
      max_parallel_requests: data.max_parallel_requests,
      budget_reset_at: data.budget_reset_at,
      model_aliases: data.model_aliases,
      created_at: data.created_at
    };

    return NextResponse.json(transformedTeam);
  } catch (error) {
    console.error('\nError in team create route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create team',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
