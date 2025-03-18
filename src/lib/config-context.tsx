'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setCookie, getCookie } from 'cookies-next';

interface ConfigContextType {
  apiBaseUrl: string;
  apiKey: string;
  isConfigured: boolean;
  updateConfig: (baseUrl: string, key: string) => void;
}

const defaultConfig: ConfigContextType = {
  apiBaseUrl: 'http://localhost:4000',
  apiKey: '',
  isConfigured: false,
  updateConfig: () => {},
};

const ConfigContext = createContext<ConfigContextType>(defaultConfig);

export const useConfig = () => useContext(ConfigContext);

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider = ({ children }: ConfigProviderProps) => {
  const [config, setConfig] = useState({
    apiBaseUrl: defaultConfig.apiBaseUrl,
    apiKey: defaultConfig.apiKey,
    isConfigured: false,
  });

  // Debug logs to track initialization and clear cache if needed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('ConfigProvider initialized');
      console.log('Current URL:', window.location.href);
      
      // Check for a URL parameter that can be used to clear the cache
      const urlParams = new URLSearchParams(window.location.search);
      console.log('URL params:', Object.fromEntries(urlParams.entries()));
      
      if (urlParams.has('clear_cache')) {
        console.log('Clearing configuration cache due to clear_cache parameter');
        
        // Clear localStorage
        console.log('Previous localStorage values:', {
          apiBaseUrl: localStorage.getItem('apiBaseUrl'),
          apiKey: localStorage.getItem('apiKey')
        });
        
        localStorage.removeItem('apiBaseUrl');
        localStorage.removeItem('apiKey');
        
        // Clear cookies
        const previousCookie = getCookie('config-set');
        console.log('Previous cookie value:', previousCookie);
        setCookie('config-set', '', { maxAge: 0, path: '/' });
        
        // Force clear all localStorage for this domain
        console.log('Forcing clear of all localStorage');
        localStorage.clear();
        
        // Update state to reflect cleared configuration
        setConfig({
          apiBaseUrl: defaultConfig.apiBaseUrl,
          apiKey: defaultConfig.apiKey,
          isConfigured: false,
        });
        
        console.log('Configuration state after clearing:', {
          apiBaseUrl: defaultConfig.apiBaseUrl,
          apiKey: defaultConfig.apiKey ? '[REDACTED]' : '',
          isConfigured: false
        });
        
        // Remove the parameter from the URL without reloading the page
        urlParams.delete('clear_cache');
        const newUrl = window.location.pathname + 
          (urlParams.toString() ? '?' + urlParams.toString() : '');
        window.history.replaceState({}, document.title, newUrl);
        console.log('Updated URL:', window.location.href);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load configuration from localStorage on client-side
    const storedBaseUrl = localStorage.getItem('apiBaseUrl');
    const storedApiKey = localStorage.getItem('apiKey');
    const configSet = getCookie('config-set');
    
    console.log('Loading config from storage:', {
      baseUrlExists: !!storedBaseUrl,
      apiKeyExists: !!storedApiKey,
      configSetCookie: configSet
    });
    
    if (storedBaseUrl && storedApiKey) {
      console.log('Setting config from storage:', {
        baseUrl: storedBaseUrl
      });
      
      // Only consider as configured if we have a non-empty API key
      // and the base URL is not just the default value
      const isActuallyConfigured = 
        storedApiKey.trim() !== '' && 
        (storedBaseUrl !== defaultConfig.apiBaseUrl || storedApiKey.trim() !== '');
      
      setConfig({
        apiBaseUrl: storedBaseUrl,
        apiKey: storedApiKey,
        isConfigured: isActuallyConfigured,
      });
      
      // Ensure cookie is set only if actually configured
      if (configSet !== 'true' && isActuallyConfigured) {
        setCookie('config-set', 'true', { maxAge: 31536000, path: '/' });
      }
    }
  }, []);

  const updateConfig = (baseUrl: string, key: string) => {
    console.log('Updating config:', { baseUrl });
    console.log('API key provided:', key ? 'Yes (length: ' + key.length + ')' : 'No');
    
    // Validate inputs
    const trimmedKey = key.trim();
    const isActuallyConfigured = 
      trimmedKey !== '' && 
      (baseUrl !== defaultConfig.apiBaseUrl || trimmedKey !== '');
    
    if (!isActuallyConfigured) {
      console.warn('Attempted to update config with invalid values');
      return;
    }
    
    // Log localStorage state before update
    console.log('localStorage before update:', {
      apiBaseUrl: localStorage.getItem('apiBaseUrl'),
      apiKeyExists: !!localStorage.getItem('apiKey')
    });
    
    // Save to localStorage
    try {
      localStorage.setItem('apiBaseUrl', baseUrl);
      localStorage.setItem('apiKey', trimmedKey);
      
      // Verify the values were stored correctly
      console.log('localStorage after update:', {
        apiBaseUrl: localStorage.getItem('apiBaseUrl'),
        apiKeyExists: !!localStorage.getItem('apiKey'),
        apiKeyLength: localStorage.getItem('apiKey')?.length
      });
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
    
    // Set cookie for middleware to detect configuration status
    // Max age: 1 year (60 * 60 * 24 * 365)
    setCookie('config-set', 'true', { maxAge: 31536000, path: '/' });
    
    // Update state
    setConfig({
      apiBaseUrl: baseUrl,
      apiKey: trimmedKey,
      isConfigured: true,
    });
    
    console.log('Config updated successfully');
    
    // Dump all localStorage keys for verification
    console.log('All localStorage keys after update:', Object.keys(localStorage));
  };

  return (
    <ConfigContext.Provider 
      value={{
        apiBaseUrl: config.apiBaseUrl,
        apiKey: config.apiKey,
        isConfigured: config.isConfigured,
        updateConfig,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};
