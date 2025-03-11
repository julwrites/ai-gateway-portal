import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET() {
  logger.log('Test API Route: Received request');
  
  try {
    const testData = {
      message: 'API route is working',
      timestamp: new Date().toISOString(),
      env: {
        apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
        hasApiKey: !!process.env.LITELLM_API_KEY,
        nodeEnv: process.env.NODE_ENV
      }
    };
    
    logger.log('Test API Route: Sending response', testData);
    return NextResponse.json(testData);
  } catch (error) {
    logger.error('Test API Route: Error occurred', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
