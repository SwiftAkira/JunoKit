#!/bin/bash

echo "🔐 JunoKit Slack Integration - AWS Secrets Update"
echo "=================================================="
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI configured"

# Get current secrets
echo "📥 Getting current secrets..."
CURRENT_SECRETS=$(aws secretsmanager get-secret-value --secret-id junokit-api-secrets --query SecretString --output text 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "❌ Failed to get current secrets. Make sure junokit-api-secrets exists."
    exit 1
fi

echo "Current secrets retrieved ✅"

# Prompt for Slack credentials
echo ""
echo "Please enter your Slack app credentials:"
echo "---------------------------------------"
read -p "Slack Client ID: " SLACK_CLIENT_ID
read -s -p "Slack Client Secret: " SLACK_CLIENT_SECRET
echo ""

if [ -z "$SLACK_CLIENT_ID" ] || [ -z "$SLACK_CLIENT_SECRET" ]; then
    echo "❌ Both Client ID and Client Secret are required."
    exit 1
fi

# Parse current secrets and add Slack credentials
UPDATED_SECRETS=$(echo "$CURRENT_SECRETS" | jq --arg clientId "$SLACK_CLIENT_ID" --arg clientSecret "$SLACK_CLIENT_SECRET" '. + {slackClientId: $clientId, slackClientSecret: $clientSecret}')

if [ $? -ne 0 ]; then
    echo "❌ Failed to parse current secrets. Please check the secret format."
    exit 1
fi

# Update the secret
echo "🔄 Updating AWS Secrets Manager..."
aws secretsmanager update-secret \
    --secret-id junokit-api-secrets \
    --secret-string "$UPDATED_SECRETS"

if [ $? -eq 0 ]; then
    echo "✅ Slack credentials successfully added to AWS Secrets Manager!"
    echo ""
    echo "Next steps:"
    echo "1. Deploy the updated infrastructure: cd infrastructure/aws-cdk && npm run deploy"
    echo "2. Test the Slack integration in your app"
else
    echo "❌ Failed to update secrets. Please check your permissions."
    exit 1
fi 