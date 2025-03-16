// Create a simple dropdown menu
function createSettingsMenu() {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.right = '20px';
  container.style.zIndex = '1000';
  
  // Add the menu HTML
  container.innerHTML = `
    <div style="position: relative; display: inline-block;">
      <button style="background-color: transparent; color: #888; padding: 10px; font-size: 14px; border: none; cursor: pointer;">Settings</button>
      <div style="display: none; position: absolute; right: 0; background-color: #f9f9f9; min-width: 200px; box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2); z-index: 1;">
        <a href="#" id="base-url-btn" style="color: black; padding: 12px 16px; text-decoration: none; display: block;">Set API Base URL</a>
        <a href="#" id="api-key-btn" style="color: black; padding: 12px 16px; text-decoration: none; display: block;">Set API Key</a>
        <a href="#" id="test-btn" style="color: black; padding: 12px 16px; text-decoration: none; display: block;">Test Connection</a>
      </div>
    </div>
  `;
  
  // Append to document
  document.body.appendChild(container);
  
  // Show menu on hover
  const button = container.querySelector('button');
  const menu = container.querySelector('div > div');
  
  if (button && menu) {
    button.addEventListener('mouseenter', () => {
      menu.style.display = 'block';
    });
    
    container.addEventListener('mouseleave', () => {
      menu.style.display = 'none';
    });
  }
  
  // Add click handlers
  document.getElementById('base-url-btn').addEventListener('click', (e) => {
    e.preventDefault();
    window.__TAURI__.event.emit('menu-action', { type: 'base-url' });
  });
  
  document.getElementById('api-key-btn').addEventListener('click', (e) => {
    e.preventDefault();
    window.__TAURI__.event.emit('menu-action', { type: 'api-key' });
  });
  
  document.getElementById('test-btn').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/test';
  });
  
  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'u') {
        e.preventDefault();
        window.__TAURI__.event.emit('menu-action', { type: 'base-url' });
      } else if (e.key === 'k') {
        e.preventDefault();
        window.__TAURI__.event.emit('menu-action', { type: 'api-key' });
      } else if (e.key === 't') {
        e.preventDefault();
        window.location.href = '/test';
      }
    }
  });
}

// Initialize when the document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createSettingsMenu);
} else {
  createSettingsMenu();
}
