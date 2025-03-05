import { NextResponse } from 'next/server';
import { Team } from '@/types/teams';
import { getApiUrl, getHeaders } from '@/lib/config';

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const user_id = url.searchParams.get('user_id');
    const organization_id = url.searchParams.get('organization_id');

    // Build query string
    const queryParams = new URLSearchParams();
    if (user_id) queryParams.append('user_id', user_id);
    if (organization_id) queryParams.append('organization_id', organization_id);
    const queryString = queryParams.toString();

    const response = await fetch(
      getApiUrl(`/team/list${queryString ? `?${queryString}` : ''}`),
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

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
