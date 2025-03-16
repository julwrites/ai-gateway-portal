import { NextResponse } from 'next/server';
import { Team } from '@/types/teams';
import { getHeaders, getApiUrl } from '@/lib/config';

export const revalidate = 60; // Adjust as needed

export async function GET(request: Request) {
  console.log('\n=== Fetching Teams ===');
  
  try {
    const headers = getHeaders();
    if (!headers.Authorization) {
      throw new Error('API key not configured');
    }

    const url = getApiUrl('/team/list');

    console.log('Request Details:');
    console.log('URL:', url);
    console.log('Headers:', {
      ...headers,
      Authorization: 'Bearer [REDACTED]'
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    console.log('\nResponse Details:');
    console.log('Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error Response:', errorText);
      throw new Error(`Failed to fetch teams: ${response.statusText}`);
    }

    const teams: Team[] = await response.json();
    console.log('\nTeams Fetched:', teams.length);

    return NextResponse.json(teams);
  } catch (error) {
    console.error('\nError in teams API route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch teams',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}