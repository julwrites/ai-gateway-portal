'use client';

export default function PlainFormTest() {
  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <h1>Plain HTML Form Test</h1>
      <p>This is a stripped-down form with no React state or complex components</p>
      
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        alert(`Form submitted with values: 
          Base URL: ${formData.get('baseUrl')}
          API Key: ${formData.get('apiKey')}`
        );
      }} style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '15px',
        marginTop: '20px'
      }}>
        <div>
          <label htmlFor="baseUrl" style={{ display: 'block', marginBottom: '5px' }}>
            Base URL:
          </label>
          <input 
            id="baseUrl" 
            name="baseUrl"
            type="text" 
            placeholder="Enter base URL" 
            required
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </div>
        
        <div>
          <label htmlFor="apiKey" style={{ display: 'block', marginBottom: '5px' }}>
            API Key:
          </label>
          <input 
            id="apiKey" 
            name="apiKey"
            type="password" 
            placeholder="Enter API key" 
            required
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </div>
        
        <button 
          type="submit"
          style={{
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '10px 15px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Submit Form
        </button>
        
        <div style={{ marginTop: '20px', fontSize: '14px' }}>
          <p><strong>Debug:</strong> This form uses browser-native validation with the 'required' attribute on inputs and no JavaScript disabled state.</p>
          <p>The button should be clickable as long as both fields have values.</p>
        </div>
      </form>
      
      <script 
        dangerouslySetInnerHTML={{ 
          __html: `
            document.addEventListener('DOMContentLoaded', () => {
              console.log('Plain form page loaded');
              
              // Add manual form validation for older browsers
              const form = document.querySelector('form');
              const baseUrlInput = document.getElementById('baseUrl');
              const apiKeyInput = document.getElementById('apiKey');
              const submitButton = document.querySelector('button[type="submit"]');
              
              if (form && baseUrlInput && apiKeyInput && submitButton) {
                const validateForm = () => {
                  const isValid = baseUrlInput.value.trim() !== '' && 
                                  apiKeyInput.value.trim() !== '';
                  
                  console.log('Form validation:', {
                    baseUrl: baseUrlInput.value.trim() !== '',
                    apiKey: apiKeyInput.value.trim() !== '',
                    isValid
                  });
                  
                  // For browsers that don't respect the required attribute
                  submitButton.disabled = !isValid;
                };
                
                baseUrlInput.addEventListener('input', validateForm);
                apiKeyInput.addEventListener('input', validateForm);
                
                // Initial validation
                validateForm();
              }
            });
          `
        }} 
      />
    </div>
  );
}
