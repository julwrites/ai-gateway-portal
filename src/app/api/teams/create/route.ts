import { NextResponse } from 'next/server';
import { isValidDuration } from '@/lib/validators';

// Define the interface for the request body
interface TeamCreateRequest {
  team_alias?: string;
  team_id?: string;
  organization_id?: string;
  admins?: string[];
  members?: string[];
  members_with_roles?: Array<{ role: string; user_id: string }>;
  metadata?: Record<string, any>;
  tpm_limit?: number;
  rpm_limit?: number;
  max_budget?: number;
  budget_duration?: string;
  models?: string[];
  blocked?: boolean;
}

interface APIErrorResponse {
  error: {
    message: string;
    type: string;
    param: string;
    code: string;
  };
}

export async function POST(request: Request) {
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

    const teamData: TeamCreateRequest = await request.json();
    
    // Ensure arrays are properly handled
    teamData.models = teamData.models || [];
    teamData.admins = teamData.admins || [];
    teamData.members = teamData.members || [];
    teamData.members_with_roles = teamData.members_with_roles || [];

    if (teamData.budget_duration && !isValidDuration(teamData.budget_duration)) {
      return NextResponse.json(
        { 
          error: {
            message: 'Invalid budget duration format. Use format like "1d", "7d", "24h", "60m", etc.',
            type: 'validation_error',
            param: 'budget_duration',
            code: '400'
          }
        },
        { status: 400 }
      );
    }

    // Build URL
    const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    const url = `${baseUrl}/team/new`;


    // Add handling for litellm-changed-by header
    const litellmChangedBy = request.headers.get('litellm-changed-by');
    if (litellmChangedBy) {
      Object.assign(headers, { 'litellm-changed-by': litellmChangedBy });    
    }

    console.log('Team data being sent to API:', JSON.stringify(teamData, null, 2));
    console.log('API URL:', url);
    console.log('Headers:', {
      ...headers,
      Authorization: 'Bearer [REDACTED]'
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData),
    });

    console.log('Response status:', response.status);
    
    // Log the full response for debugging
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    let createdTeam;
    try {
      createdTeam = JSON.parse(responseText);
      console.log('Created team:', JSON.stringify(createdTeam, null, 2));
    } catch (e) {
      console.error('Failed to parse response:', e);
      throw new Error('Invalid JSON response from server');
    }

    if (!response.ok) {
      const errorResponse: APIErrorResponse = await response.json();
      console.error('Full error response:', errorResponse);

      // Check for the specific foreign key constraint error
      if (errorResponse.error.message.includes('Foreign key constraint failed') &&
          errorResponse.error.message.includes('LiteLLM_TeamTable_organization_id_fkey')) {
        return NextResponse.json(
          {
            error: {
              message: 'The specified organization does not exist. Please provide a valid organization_id.',
              type: 'validation_error',
              param: 'organization_id',
              code: '400'
            }
          },
          { status: 400 }
        );
      }

      // For other errors, return the original error response
      return NextResponse.json(errorResponse, { status: parseInt(errorResponse.error.code) });
    }

    return NextResponse.json(createdTeam);
  } catch (error) {
    console.error('Error in teams create API route:', error);
    return NextResponse.json(
      { 
        detail: [{ 
          msg: 'Failed to create team', 
          loc: ['body'], 
          type: error instanceof Error ? error.name : 'UnknownError'
        }]
      },
      { status: 422 }
    );
  }
}
