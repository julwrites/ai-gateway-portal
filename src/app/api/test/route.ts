import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// GET endpoint for basic connectivity test
export async function GET() {
  logger.log('Test API Route: Received GET request');
  
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

// POST endpoint for testing connection to LiteLLM API
export async function POST(request: Request) {
  logger.log('Test API Route: Received POST request for API connection test');
  
  try {
    // Parse request body
    const body = await request.json();
    const { url, apiKey } = body;
    
    if (!url) {
      logger.error('Test API Route: Missing URL parameter');
      return NextResponse.json(
        { success: false, message: 'URL is required' },
        { status: 400 }
      );
    }
    
    if (!apiKey) {
      logger.error('Test API Route: Missing API key');
      return NextResponse.json(
        { success: false, message: 'API key is required' },
        { status: 400 }
      );
    }
    
    logger.log(`Test API Route: Testing connection to: ${url}`);
    
    // Attempt to connect to the LiteLLM API
    try {
      // Construct the models endpoint URL
      const modelsEndpoint = `${url}/models`;
      logger.log(`Test API Route: Trying to fetch models from: ${modelsEndpoint}`);
      
      // Make the request
      const response = await fetch(modelsEndpoint, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        // Set a timeout to avoid hanging
        signal: AbortSignal.timeout(10000),
      });
      
      if (!response.ok) {
        logger.error(`Test API Route: API returned status ${response.status}`);
        return NextResponse.json(
          { 
            success: false, 
            message: `API returned status ${response.status}` 
          },
          { status: 400 }
        );
      }
      
      // Try to parse the response
      const data = await response.json();
      
      logger.log('Test API Route: Connection successful, received data:', data);
      
      return NextResponse.json({
        success: true,
        message: 'Connection successful',
        models: data
      });
      
    } catch (error: any) {
      logger.error('Test API Route: Connection test failed', error);
      return NextResponse.json(
        { 
          success: false, 
          message: `Connection failed: ${error.message || 'Unknown error'}` 
        },
        { status: 400 }
      );
    }
    
  } catch (error: any) {
    logger.error('Test API Route: Error processing request', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `Server error: ${error.message || 'Unknown error'}` 
      },
      { status: 500 }
    );
  }
}
