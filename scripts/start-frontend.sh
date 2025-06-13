#!/bin/bash

# Start JunoKit Frontend Development Server
# This script sets the required environment variables and starts the Next.js dev server

echo "🚀 Starting JunoKit Frontend Development Server..."
echo ""

# Change to frontend directory (from project root)
if [ ! -d "frontend" ]; then
  echo "❌ Error: Please run this script from the JunoKit project root directory"
  exit 1
fi

cd frontend

# Export environment variables
export NEXT_PUBLIC_USER_POOL_ID=eu-north-1_QUaZ7e7OU
export NEXT_PUBLIC_USER_POOL_CLIENT_ID=66ako4srqdk2aghompd956bloa
export NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-north-1_QUaZ7e7OU
export NEXT_PUBLIC_COGNITO_CLIENT_ID=66ako4srqdk2aghompd956bloa
export NEXT_PUBLIC_API_GATEWAY_URL=https://nayr2j5df2.execute-api.eu-north-1.amazonaws.com/v1
export NEXT_PUBLIC_IDENTITY_POOL_ID=eu-north-1:14cedb7e-3002-4cbd-b1f3-c27f5e1349ba
export NEXT_PUBLIC_AWS_REGION=eu-north-1

echo "📡 Environment variables set:"
echo "   • User Pool: $NEXT_PUBLIC_USER_POOL_ID"
echo "   • Client ID: $NEXT_PUBLIC_USER_POOL_CLIENT_ID"
echo "   • API Gateway: $NEXT_PUBLIC_API_GATEWAY_URL"
echo "   • Region: $NEXT_PUBLIC_AWS_REGION"
echo ""

echo "🔄 Starting Next.js development server..."
npm run dev 