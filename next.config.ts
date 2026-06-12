import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Proxy /api requests to the backend server. This keeps the frontend same-origin
    // during development and avoids CORS / LAN IP issues. If NEXT_PUBLIC_API_URL is
    // provided it will be used (for testing from other devices); otherwise default
    // to localhost:5000.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    return [
      {
        source: '/api/:path*',
        destination: apiUrl.replace(/\/$/, '') + '/:path*',
      },
    ];
  },
};

export default nextConfig;
