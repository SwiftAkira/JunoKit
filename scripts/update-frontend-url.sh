#!/bin/bash

echo "🌐 JunoKit Frontend URL Configuration"
echo "====================================="

# Get current frontend URL from user
read -p "Enter your frontend URL (e.g., https://your-domain.com): " FRONTEND_URL

if [ -z "$FRONTEND_URL" ]; then
    echo "❌ Frontend URL is required."
    exit 1
fi

echo "Updating configuration files with: $FRONTEND_URL"

# Update infrastructure
export FRONTEND_URL="$FRONTEND_URL"

echo "✅ Environment variable set for deployment"
echo ""
echo "Now deploy with:"
echo "cd infrastructure/aws-cdk && npm run deploy"
echo ""
echo "Your OAuth callback URL will be:"
echo "$FRONTEND_URL/integrations/slack/callback"
echo ""
echo "Make sure to add this to your Slack app's redirect URLs!" 