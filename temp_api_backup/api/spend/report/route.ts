import { NextResponse } from 'next/server';
import { getHeaders, getApiUrl } from '@/lib/config';

export async function GET(request: Request) {
  try {
    const headers = getHeaders();
    if (!headers.Authorization) {
      throw new Error('API key not configured');
    }

    const { searchParams } = new URL(request.url);
    const url = getApiUrl('/global/spend/report') + '?' + searchParams.toString();

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch spend report: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in spend report API route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch spend report',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}