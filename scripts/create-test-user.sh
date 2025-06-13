#!/bin/bash

# Create Test User Script for JunoKit
# This script creates test users in the Cognito User Pool

USER_POOL_ID="eu-north-1_QUaZ7e7OU"
REGION="eu-north-1"

echo "🔐 Creating test user accounts in Cognito User Pool: $USER_POOL_ID"

# Create test user 1
echo "Creating testuser@example.com..."
aws cognito-idp admin-create-user \
  --user-pool-id "$USER_POOL_ID" \
  --username "testuser@example.com" \
  --user-attributes \
    Name=email,Value=testuser@example.com \
    Name=given_name,Value=Test \
    Name=family_name,Value=User \
  --temporary-password "TempPass123!" \
  --message-action SUPPRESS \
  --region "$REGION"

# Set permanent password for test user 1
echo "Setting permanent password..."
aws cognito-idp admin-set-user-password \
  --user-pool-id "$USER_POOL_ID" \
  --username "testuser@example.com" \
  --password "TestUser123!" \
  --permanent \
  --region "$REGION"

echo "✅ Test user created successfully!"
echo ""
echo "🔑 Login credentials:"
echo "Email: testuser@example.com"
echo "Password: TestUser123!"
echo ""
echo "You can now log in to JunoKit with these credentials." 