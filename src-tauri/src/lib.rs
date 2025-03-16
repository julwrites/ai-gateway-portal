use tauri::{Manager, Listener, Emitter};
use std::collections::HashMap;
use tauri_plugin_store::StoreBuilder;

// Configuration structure
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct AppConfig {
    api_base_url: String,
    api_key: String,
}

// Default configuration
impl Default for AppConfig {
    fn default() -> Self {
        Self {
            api_base_url: String::from("http://localhost:4000"),
            api_key: String::new(),
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_store::Builder::default().build())
    .setup(|app| {
      let app_handle = app.app_handle();
      
      // Initialize logging
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Initialize the config store
      let store_path = app.path().app_config_dir().unwrap().join("settings.json");
      let store = StoreBuilder::new(app.app_handle(), store_path).build().expect("Failed to build store");
      
      // Load the store or create it with default values if it doesn't exist
      let _ = store.reload();
      
      // Check if we have config values, if not set defaults
      if !store.has("api_base_url") {
          let _ = store.set("api_base_url".to_string(), serde_json::json!("http://localhost:4000"));
      }
      if !store.has("api_key") {
          let _ = store.set("api_key".to_string(), serde_json::json!(""));
      }
      
      // Save the store
      let _ = store.save();
      
      // Make a clone for later use
      let store_ref = store.clone();
      
      // Add the store to app state
      app.manage(store);
      
      // Get the main window
      let main_window = app.get_webview_window("main").unwrap();
      main_window.show().unwrap();
      
      // Inject simple JS code that adds a menu component
      main_window.eval("
        // Create settings menu
        const setupMenu = () => {
          const menu = document.createElement('div');
          menu.style.position = 'fixed';
          menu.style.top = '0';
          menu.style.right = '20px';
          menu.style.zIndex = '1000';
          
          menu.innerHTML = `
            <div style='position: relative; display: inline-block;'>
              <button style='background-color: transparent; color: #888; padding: 10px; font-size: 14px; border: none; cursor: pointer;'>Settings</button>
              <div style='display: none; position: absolute; right: 0; background-color: #f9f9f9; min-width: 200px; box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2); z-index: 1;'>
                <a href='/settings' id='settings-item' style='color: black; padding: 12px 16px; text-decoration: none; display: block;'>Settings</a>
                <a href='/test' id='test-item' style='color: black; padding: 12px 16px; text-decoration: none; display: block;'>Test Connection</a>
              </div>
            </div>
          `;
          
          document.body.appendChild(menu);
          
          // Show menu on hover
          const button = menu.querySelector('button');
          const dropdown = menu.querySelector('div > div');
          
          button.addEventListener('mouseenter', () => {
            dropdown.style.display = 'block';
          });
          
          menu.addEventListener('mouseleave', () => {
            dropdown.style.display = 'none';
          });
        };
        
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', setupMenu);
        } else {
          setupMenu();
        }
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
          if (e.ctrlKey || e.metaKey) {
            if (e.key === 's') {
              e.preventDefault();
              window.location.href = '/settings';
            } else if (e.key === 't') {
              e.preventDefault();
              window.location.href = '/test';
            }
          }
        });
      ").expect("Failed to inject menu script");
      
      // Listen for the menu event
      let app_handle_clone = app.app_handle().clone();
      main_window.listen("menu-action", move |event| {
        let payload = event.payload();
        
        // Parse the payload to get the action type
        if let Ok(data) = serde_json::from_str::<serde_json::Value>(payload) {
          if let Some(action_type) = data["type"].as_str() {
            let window = app_handle_clone.get_webview_window("main").unwrap();
            
            println!("Received menu action: {}", action_type);
            
            match action_type {
              "base-url" => {
                // Show Base URL dialog
                let mut dialog_data = HashMap::new();
                dialog_data.insert("key", "api_base_url");
                dialog_data.insert("title", "Set API Base URL");
                println!("Emitting show-config-dialog for api_base_url");
                if let Err(err) = window.emit("show-config-dialog", dialog_data) {
                  println!("Error emitting event: {:?}", err);
                } else {
                  println!("Successfully emitted show-config-dialog event");
                }
              },
              "api-key" => {
                // Show API Key dialog
                let mut dialog_data = HashMap::new();
                dialog_data.insert("key", "api_key");
                dialog_data.insert("title", "Set API Key");
                println!("Emitting show-config-dialog for api_key");
                if let Err(err) = window.emit("show-config-dialog", dialog_data) {
                  println!("Error emitting event: {:?}", err);
                } else {
                  println!("Successfully emitted show-config-dialog event");
                }
              },
              _ => {
                println!("Unknown action type: {}", action_type);
              }
            }
          }
        }
      });

      // No need to prompt for configuration on startup anymore,
      // Next.js application will handle this with the /settings page
      let maybe_base_url = store_ref.get("api_base_url");
      let maybe_api_key = store_ref.get("api_key");
      
      let needs_base_url = maybe_base_url.is_none() || maybe_base_url.as_ref().unwrap().as_str().unwrap_or("").is_empty();
      let needs_api_key = maybe_api_key.is_none() || maybe_api_key.as_ref().unwrap().as_str().unwrap_or("").is_empty();
      
      // Log configuration status
      if needs_base_url || needs_api_key {
        println!("Configuration incomplete: application will redirect to settings page");
      } else {
        println!("Configuration loaded: API Base URL and API Key are set");
      }

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      get_config,
      set_config
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

// Get configuration
#[tauri::command]
fn get_config(app_handle: tauri::AppHandle) -> Result<AppConfig, String> {
  let store = app_handle.state::<tauri_plugin_store::Store<tauri::Wry>>();
  
  let api_base_url = store.get("api_base_url")
    .and_then(|v| v.as_str().map(|s| s.to_string()))
    .unwrap_or_else(|| "http://localhost:4000".to_string());
    
  let api_key = store.get("api_key")
    .and_then(|v| v.as_str().map(|s| s.to_string()))
    .unwrap_or_default();
  
  Ok(AppConfig {
    api_base_url,
    api_key,
  })
}

// Set configuration
#[tauri::command]
fn set_config(app_handle: tauri::AppHandle, key: String, value: String) -> Result<(), String> {
  let store = app_handle.state::<tauri_plugin_store::Store<tauri::Wry>>();
  
  match key.as_str() {
    "api_base_url" => {
      store.set(key.clone(), serde_json::json!(value));
    },
    "api_key" => {
      store.set(key.clone(), serde_json::json!(value));
    },
    _ => return Err(format!("Unknown configuration key: {}", key)),
  }
  
  // Save to persistent storage
  store.save().map_err(|e| e.to_string())?;
  
  Ok(())
}
