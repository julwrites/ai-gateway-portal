// Create a simple dropdown menu with direct dialog functionality
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
  
  // Show menu on hover and click
  const button = container.querySelector('button');
  const menu = container.querySelector('div > div');
  
  if (button && menu) {
    button.addEventListener('mouseenter', () => {
      menu.style.display = 'block';
    });
    
    button.addEventListener('click', () => {
      // Toggle menu display on click
      if (menu.style.display === 'block') {
        menu.style.display = 'none';
      } else {
        menu.style.display = 'block';
      }
    });
    
    // Only hide on mouseleave if not from a click action
    container.addEventListener('mouseleave', () => {
      // Add a small delay to prevent menu from disappearing too quickly
      setTimeout(() => {
        menu.style.display = 'none';
      }, 300);
    });
  }
  
  // Create a simple dialog for configuration
  const createDialog = (title, key, initialValue = '') => {
    // Remove any existing dialog
    const existingDialog = document.getElementById('settings-dialog');
    if (existingDialog) {
      existingDialog.remove();
    }
    
    // Create dialog container
    const dialogBackground = document.createElement('div');
    dialogBackground.id = 'settings-dialog';
    dialogBackground.style.position = 'fixed';
    dialogBackground.style.inset = '0';
    dialogBackground.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    dialogBackground.style.display = 'flex';
    dialogBackground.style.alignItems = 'center';
    dialogBackground.style.justifyContent = 'center';
    dialogBackground.style.zIndex = '9999';
    
    // Create dialog content
    const dialogContent = document.createElement('div');
    dialogContent.style.background = 'white';
    dialogContent.style.padding = '20px';
    dialogContent.style.borderRadius = '8px';
    dialogContent.style.width = '400px';
    dialogContent.style.maxWidth = '90%';
    
    // Add dialog HTML
    dialogContent.innerHTML = `
      <h2 style="margin-top: 0; margin-bottom: 16px;">${title}</h2>
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px;">Value:</label>
        <input 
          id="config-value-input" 
          type="${key === 'api_key' ? 'password' : 'text'}" 
          value="${initialValue}" 
          style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
        />
      </div>
      <div style="text-align: right; margin-top: 20px;">
        <button id="dialog-cancel" style="padding: 8px 16px; margin-right: 8px; background: #f1f1f1; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
        <button id="dialog-save" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Save</button>
      </div>
    `;
    
    // Add dialog to document
    dialogBackground.appendChild(dialogContent);
    document.body.appendChild(dialogBackground);
    
    // Focus the input
    setTimeout(() => {
      document.getElementById('config-value-input').focus();
    }, 100);
    
    // Handle cancel button
    document.getElementById('dialog-cancel').addEventListener('click', () => {
      dialogBackground.remove();
    });
    
    // Handle save button
    document.getElementById('dialog-save').addEventListener('click', () => {
      const value = document.getElementById('config-value-input').value;
      
      // Call Tauri's API to save the configuration
      window.__TAURI__.invoke('set_config', { key, value })
        .then(() => {
          console.log(`Successfully saved ${key}`);
          dialogBackground.remove();
          
          // If needed, reload the page or update the UI
          if (key === 'api_base_url') {
            window.location.reload();
          }
        })
        .catch(err => {
          console.error(`Failed to save ${key}:`, err);
          alert(`Failed to save: ${err.message || 'Unknown error'}`);
        });
    });
    
    // Close dialog when clicking outside
    dialogBackground.addEventListener('click', (e) => {
      if (e.target === dialogBackground) {
        dialogBackground.remove();
      }
    });
    
    // Handle Enter key
    dialogContent.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('dialog-save').click();
      } else if (e.key === 'Escape') {
        document.getElementById('dialog-cancel').click();
      }
    });
  };
  
  // Get the current configuration from Tauri
  const getCurrentConfig = () => {
    return window.__TAURI__.invoke('get_config').catch(err => {
      console.error('Failed to get config:', err);
      return { api_base_url: '', api_key: '' };
    });
  };
  
  // Add click handlers for menu items
  const baseUrlBtn = document.getElementById('base-url-btn');
  if (baseUrlBtn) {
    baseUrlBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      console.log('Base URL button clicked');
      try {
        const config = await getCurrentConfig();
        createDialog('Set API Base URL', 'api_base_url', config.api_base_url);
      } catch (error) {
        console.error('Error showing base URL dialog:', error);
      }
    });
  } else {
    console.error('Base URL button not found');
  }
  
  const apiKeyBtn = document.getElementById('api-key-btn');
  if (apiKeyBtn) {
    apiKeyBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      console.log('API Key button clicked');
      try {
        const config = await getCurrentConfig();
        createDialog('Set API Key', 'api_key', config.api_key);
      } catch (error) {
        console.error('Error showing API key dialog:', error);
      }
    });
  } else {
    console.error('API Key button not found');
  }
  
  const testBtn = document.getElementById('test-btn');
  if (testBtn) {
    testBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/test';
    });
  } else {
    console.error('Test button not found');
  }
  
  // Add keyboard shortcuts
  document.addEventListener('keydown', async (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'u') {
        e.preventDefault();
        const config = await getCurrentConfig();
        createDialog('Set API Base URL', 'api_base_url', config.api_base_url);
      } else if (e.key === 'k') {
        e.preventDefault();
        const config = await getCurrentConfig();
        createDialog('Set API Key', 'api_key', config.api_key);
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
