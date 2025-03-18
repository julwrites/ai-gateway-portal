// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod api;

use api::{test_connection, test_api_connection};

fn main() {
    // Initialize the Tauri application
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            test_connection,
            test_api_connection
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
