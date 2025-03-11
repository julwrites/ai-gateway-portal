// Simple script to test connection to API server
const https = require('https');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Debug environment
console.log('\nEnvironment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
console.log('API Key present:', !!process.env.LITELLM_API_KEY);
console.log('API Key:', process.env.LITELLM_API_KEY ? `${process.env.LITELLM_API_KEY.slice(0, 10)}...` : 'not set');

// Verify API key is present
const apiKey = process.env.LITELLM_API_KEY;
if (!apiKey) {
  console.error('\nError: LITELLM_API_KEY is not set in .env file');
  process.exit(1);
}

// Parse API base URL
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!apiBaseUrl) {
  console.error('\nError: NEXT_PUBLIC_API_BASE_URL is not set in .env file');
  process.exit(1);
}

const url = new URL('/model/info', apiBaseUrl);
const options = {
  hostname: url.hostname,
  port: url.protocol === 'https:' ? 443 : 80,
  path: url.pathname,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
};

console.log('\nRequest Details:');
console.log('URL:', url.toString());
console.log('Method:', options.method);
console.log('Headers:', { ...options.headers, Authorization: 'Bearer [REDACTED]' });

console.log('\nTesting connection to API server...');

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\nResponse body:');
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('\nError:', error);
});

req.end();
