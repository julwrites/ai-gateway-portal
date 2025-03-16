// Create script element
const script = document.createElement('script');
script.type = 'text/javascript';

// Load from URL with timestamp to avoid caching
script.src = '/__tauri_assets__/assets/menu-app.js?t=' + new Date().getTime();

// Add to document
document.head.appendChild(script);
