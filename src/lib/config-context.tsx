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

  // Debug logs to track initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('ConfigProvider initialized');
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
      
      setConfig({
        apiBaseUrl: storedBaseUrl,
        apiKey: storedApiKey,
        isConfigured: true,
      });
      
      // Ensure cookie is set
      if (configSet !== 'true') {
        setCookie('config-set', 'true', { maxAge: 31536000, path: '/' });
      }
    }
  }, []);

  const updateConfig = (baseUrl: string, key: string) => {
    console.log('Updating config:', { baseUrl });
    
    // Save to localStorage
    localStorage.setItem('apiBaseUrl', baseUrl);
    localStorage.setItem('apiKey', key);
    
    // Set cookie for middleware to detect configuration status
    // Max age: 1 year (60 * 60 * 24 * 365)
    setCookie('config-set', 'true', { maxAge: 31536000, path: '/' });
    
    // Update state
    setConfig({
      apiBaseUrl: baseUrl,
      apiKey: key,
      isConfigured: true,
    });
    
    console.log('Config updated successfully');
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
