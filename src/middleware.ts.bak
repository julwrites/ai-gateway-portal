import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

let isLogging = false;

export async function middleware(request: NextRequest) {
  // Only log API routes
  if (!request.url.includes('/api/')) {
    return NextResponse.next();
  }

  if (isLogging) {
    console.log('\n=== API Request ===');
    console.log('URL:', request.url);
    console.log('Method:', request.method);
    console.log('Headers:', {
      ...Object.fromEntries(request.headers.entries()),
      // Redact sensitive headers
      authorization: request.headers.get('authorization') ? '[REDACTED]' : undefined
    });
  }

  const response = await fetch(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.method !== 'GET' ? await request.text() : undefined,
  });
  const responseBody = await response.text();

  if (isLogging) {
    console.log('\n=== API Response ===');
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    try {
      const jsonBody = JSON.parse(responseBody);
      console.log('Response Body:', JSON.stringify(jsonBody, null, 2));
    } catch {
      console.log('Response Body:', responseBody);
    }
    console.log('==================\n');
  }

  // Clone the response to avoid consuming it
  return new Response(responseBody, {
    status: response.status,
    headers: response.headers,
  });
}

// Configure middleware to run only for API routes
export const config = {
  matcher: '/api/:path*',
};
