import { NextResponse } from 'next/server';
import { getHeaders, getApiUrl } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  console.log('\n=== Fetching Users ===');
  
  try {
    // Verify we have the API key
    const headers = getHeaders();
    if (!headers.Authorization) {
      throw new Error('API key not configured');
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const user_ids = searchParams.get('user_ids');
    const page = searchParams.get('page') || '1';
    const page_size = searchParams.get('page_size') || '25';

    // Build URL with query parameters
    let url = getApiUrl('/user/list');
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (user_ids) params.append('user_ids', user_ids);
    params.append('page', page);
    params.append('page_size', page_size);
    url += `?${params.toString()}`;

    // Log request details (excluding sensitive data)
    console.log('Request Details:');
    console.log('URL:', url);
    console.log('Headers:', {
      ...headers,
      Authorization: 'Bearer [REDACTED]'
    });

    // Make the request
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
      next: { revalidate: 0 }
    });

    // Log response details
    console.log('\nResponse Details:');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('Error Response:', responseText);
      throw new Error(`Failed to fetch users: ${responseText}`);
    }

    // Parse and validate response
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('\nParsed Response:', JSON.stringify(data, null, 2));
      console.log('Response type:', typeof data);
      console.log('Is array:', Array.isArray(data));
    } catch (e) {
      console.error('Failed to parse response:', e);
      throw new Error('Invalid JSON response from server');
    }

    console.log('=== Users Fetched Successfully ===\n');

    // Extract users array from the response
    const users = data.users || [];

    // Transform response to match OpenAPI schema
    const transformedUsers = users.map((user: any) => ({
      user_id: user.user_id,
      user_email: user.user_email,
      user_role: user.user_role,
      teams: user.teams || [],
      max_budget: user.max_budget,
      budget_duration: user.budget_duration,
      models: user.models || [],
      tpm_limit: user.tpm_limit,
      rpm_limit: user.rpm_limit,
      spend: user.spend,
      // Add other fields as needed
    }));

    // Return the transformed users along with pagination info
    return NextResponse.json({
      users: transformedUsers,
      total: data.total,
      page: data.page,
      page_size: data.page_size,
      total_pages: data.total_pages
    });
  } catch (error) {
    console.error('\nError in users API route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
