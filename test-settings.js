// Test script for verifying connection to LiteLLM API
// Use import for node-fetch with ES modules
import fetch from 'node-fetch';

// Load values from .env file
const baseUrl = "https://litellm.tehj.sh";
const apiKey = "sk-VHZ9DDiHIcEb-IHWwOdDLxbgswnEFX20XDIF1-4h4Z8";

console.log('Testing connection with:');
console.log('Base URL:', baseUrl);
console.log('API Key:', apiKey ? '[Configured]' : '[Not configured]');

async function testConnection() {
  const healthUrl = `${baseUrl}/health`;
  
  console.log(`\nSending request to: ${healthUrl}`);
  
  try {
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      // Avoid cached responses
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error(`❌ Connection failed with status: ${response.status}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return false;
    }
    
    const healthData = await response.json();
    console.log('✅ Connection successful!');
    console.log('Health check response:', JSON.stringify(healthData, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

// Run the test
testConnection()
  .then(isSuccessful => {
    console.log('\nTest result:', isSuccessful ? 'PASSED ✅' : 'FAILED ❌');
    if (!isSuccessful) {
      console.log('\nTroubleshooting tips:');
      console.log('1. Verify the Base URL is correct');
      console.log('2. Check if the API Key is valid');
      console.log('3. Ensure the LiteLLM server is running and accessible');
      console.log('4. Check for any network restrictions or firewall issues');
    } else {
      console.log('\nUser flow validation:');
      console.log('✅ Base URL is valid and reachable');
      console.log('✅ API Key is valid and authenticated');
      console.log('✅ User would be able to configure the app with these settings');
    }
  });
