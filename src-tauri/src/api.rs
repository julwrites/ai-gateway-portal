use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
use std::env;

#[derive(Serialize)]
pub struct TestResponse {
    message: String,
    timestamp: String,
    env: TestEnv,
}

#[derive(Serialize)]
pub struct TestEnv {
    api_base_url: Option<String>,
    has_api_key: bool,
    node_env: Option<String>,
}

#[derive(Deserialize)]
pub struct ConnectionTestRequest {
    url: String,
    api_key: String,
}

#[derive(Serialize)]
pub struct ConnectionTestResponse {
    success: bool,
    message: String,
    models: Option<serde_json::Value>,
}

#[tauri::command]
pub async fn test_connection() -> Result<TestResponse, String> {
    println!("Test API: Received GET request");
    
    // Get timestamp
    let now = SystemTime::now();
    let timestamp = now.duration_since(UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_secs();
    
    let api_base_url = env::var("NEXT_PUBLIC_API_BASE_URL").ok();
    let api_key = env::var("LITELLM_API_KEY").ok();
    let node_env = env::var("NODE_ENV").ok();
    
    Ok(TestResponse {
        message: "API route is working via Tauri 2.0".to_string(),
        timestamp: format!("{}", timestamp),
        env: TestEnv {
            api_base_url,
            has_api_key: api_key.is_some(),
            node_env,
        },
    })
}

#[tauri::command]
pub async fn test_api_connection(request: ConnectionTestRequest) -> Result<ConnectionTestResponse, String> {
    println!("Test API: Received connection test request");
    
    if request.url.is_empty() {
        return Err("URL is required".to_string());
    }
    
    if request.api_key.is_empty() {
        return Err("API key is required".to_string());
    }
    
    println!("Test API: Testing connection to: {}", request.url);
    
    // Construct the models endpoint URL
    let models_endpoint = format!("{}/models", request.url);
    println!("Test API: Trying to fetch models from: {}", models_endpoint);
    
    // Make the HTTP request
    let client = reqwest::Client::new();
    let response = client.get(&models_endpoint)
        .header("Authorization", format!("Bearer {}", request.api_key))
        .header("Content-Type", "application/json")
        .timeout(std::time::Duration::from_secs(10))
        .send()
        .await
        .map_err(|e| format!("Connection failed: {}", e))?;
    
    if !response.status().is_success() {
        return Err(format!("API returned status {}", response.status()));
    }
    
    // Try to parse the response
    let data = response.json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;
    
    println!("Test API: Connection successful");
    
    Ok(ConnectionTestResponse {
        success: true,
        message: "Connection successful".to_string(),
        models: Some(data),
    })
}
