/** @type {import('next').NextConfig} */
const nextConfig = {
  // Check if we're in development or production mode
  ...(process.env.NODE_ENV === 'development' ? {
    // In development, use standard build mode to support API routes
  } : {
    // In production, use static export for Tauri
    output: 'export',
    distDir: 'out',
  }),
  
  // Skip trailing slash redirect
  skipTrailingSlashRedirect: true,
  
  // Configure webpack to ignore Tauri modules during build
  webpack: (config, { isServer }) => {
    // Add external dependencies that should be ignored
    config.externals = [...(config.externals || []), 
      '@tauri-apps/api/tauri',
      '@tauri-apps/api/event',
      '@tauri-apps/api/window'
    ];
    
    return config;
  }
};

export default nextConfig;
