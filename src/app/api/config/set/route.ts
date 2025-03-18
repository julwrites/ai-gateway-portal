import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// This route needs to be dynamic because it uses cookies
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { apiBaseUrl, apiKey } = body;
    
    console.log('Setting server-side configuration');
    
    // Validate inputs
    if (!apiBaseUrl) {
      return NextResponse.json(
        { error: 'API Base URL is required' },
        { status: 400 }
      );
    }
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key is required' },
        { status: 400 }
      );
    }
    
    // Set HTTP-only cookies (not accessible to JavaScript)
    // Max age: 30 days
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    };
    
    // Store the configuration in cookies
    cookies().set('api-base-url', apiBaseUrl, cookieOptions);
    cookies().set('api-key', apiKey, cookieOptions);
    
    // Set a non-HTTP-only cookie to indicate configuration status
    // This one can be read by client-side JavaScript
    cookies().set('config-set', 'true', {
      ...cookieOptions,
      httpOnly: false,
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting configuration:', error);
    return NextResponse.json(
      { error: 'Failed to set configuration' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    console.log('Clearing server-side configuration');
    
    // Clear cookies
    cookies().delete('api-base-url');
    cookies().delete('api-key');
    cookies().delete('config-set');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing configuration:', error);
    return NextResponse.json(
      { error: 'Failed to clear configuration' },
      { status: 500 }
    );
  }
}
