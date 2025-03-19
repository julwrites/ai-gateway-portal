/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set custom port to avoid conflicts
  serverRuntimeConfig: {
    port: 8765
  },
  // Required for Tauri - export as static HTML/JS/CSS
  output: 'export',
  // The folder where the static files will be output
  distDir: '.next',
  // Disable image optimization to work with static exports
  images: {
    unoptimized: true,
  },
  // Configure Tauri to use static exports properly
  trailingSlash: true,
  // Disable server-side functionality for static export
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    LITELLM_API_KEY: process.env.LITELLM_API_KEY,
  },
};

export default nextConfig;
