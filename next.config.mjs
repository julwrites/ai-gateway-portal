/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set custom port to avoid conflicts
  serverRuntimeConfig: {
    port: 8765
  },
  // Enable static exports for Tauri
  output: 'export',
  // Disable image optimization since it requires server components
  images: {
    unoptimized: true,
  },
  // Disable server-side features for static export
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    LITELLM_API_KEY: process.env.LITELLM_API_KEY,
  },
  // Exclude API routes from the static export
  // This is necessary because API routes are server-side only
  experimental: {
    excludeRoutes: ['/api/:path*'],
  },
  // Ensure the app works when deployed as a static site
  trailingSlash: true,
};

export default nextConfig;
