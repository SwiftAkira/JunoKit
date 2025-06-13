import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for better Amplify compatibility
  output: 'standalone',
  trailingSlash: true,
  
  env: {
    NEXT_PUBLIC_AWS_REGION: 'eu-north-1',
    NEXT_PUBLIC_USER_POOL_ID: 'eu-north-1_QUaZ7e7OU',
    NEXT_PUBLIC_USER_POOL_CLIENT_ID: '66ako4srqdk2aghompd956bloa',
    NEXT_PUBLIC_API_URL: 'https://nayr2j5df2.execute-api.eu-north-1.amazonaws.com/v1',
  },
  
  experimental: {
    turbo: {
      rules: {},
    }
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
