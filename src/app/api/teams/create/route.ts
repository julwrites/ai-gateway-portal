import { NextResponse } from 'next/server';
import { getHeaders, getApiUrl } from '@/lib/config';

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
  model_aliases?: Record<string, string>;
  tags?: string[];
  guardrails?: string[];
}

interface APIErrorResponse {
  error: {
    message: string;
    type: string;
    param: string;
    code: string;
  };
}

function isValidDuration(duration: string): boolean {
  const validPattern = /^\d+[dhms]$/;
  return validPattern.test(duration);
}

export async function POST(request: Request) {
  try {
    const headers = getHeaders();
    if (!headers.Authorization) {
      throw new Error('API key not configured');
    }

    const teamData: TeamCreateRequest = await request.json();
    
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

    if (teamData.organization_id) {
      const isValid = await isValidOrganization(teamData.organization_id);
      if (!isValid) {
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
    }

    const url = getApiUrl('/team/new');

    // Add handling for litellm-changed-by header
    const litellmChangedBy = request.headers.get('litellm-changed-by');
    if (litellmChangedBy) {
      headers['litellm-changed-by'] = litellmChangedBy;
    }

    console.log('Team data:', teamData);
    console.log('API URL:', url);
    console.log('Headers:', headers);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData),
    });

    console.log('Response status:', response.status);

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

    const createdTeam = await response.json();
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