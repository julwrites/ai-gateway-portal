import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Team } from '@/types/teams';

export async function GET(request: Request) {
  try {
    const headersList = headers();
    const authHeader = headersList.get('authorization');

    // Get query parameters
    const url = new URL(request.url);
    const user_id = url.searchParams.get('user_id');
    const organization_id = url.searchParams.get('organization_id');

    const response = await fetch('http://localhost:4000/team/list' + 
      (user_id ? `?user_id=${user_id}` : '') +
      (organization_id ? `${user_id ? '&' : '?'}organization_id=${organization_id}` : ''), {
      method: 'GET',
      headers: {
        'Authorization': authHeader || `Bearer ${process.env.LITELLM_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch teams');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}
