import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/config';

export async function GET() {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      return NextResponse.json({ status: 'ok', connected: true });
    } else {
      return NextResponse.json(
        { status: 'error', message: 'Cannot connect to LiteLLM API' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
