#!/bin/bash

# Create User for Orion
USER_POOL_ID="eu-north-1_QUaZ7e7OU"
REGION="eu-north-1"

echo "🔐 Creating user account for project owner..."

# Create user with your email
echo "Creating user account..."
aws cognito-idp admin-create-user \
  --user-pool-id "$USER_POOL_ID" \
  --username "orion@junokit.com" \
  --user-attributes \
    Name=email,Value=orion@junokit.com \
    Name=given_name,Value=Orion \
    Name=family_name,Value=Developer \
  --temporary-password "TempPass123!" \
  --message-action SUPPRESS \
  --region "$REGION"

# Set permanent password
echo "Setting permanent password..."
aws cognito-idp admin-set-user-password \
  --user-pool-id "$USER_POOL_ID" \
  --username "orion@junokit.com" \
  --password "JunoKit2024!" \
  --permanent \
  --region "$REGION"

echo "✅ User account created successfully!"
echo ""
echo "🔑 Your login credentials:"
echo "Email: orion@junokit.com"
echo "Password: JunoKit2024!"
echo ""

# Also create a simple demo user
echo "Creating demo user..."
aws cognito-idp admin-create-user \
  --user-pool-id "$USER_POOL_ID" \
  --username "demo@junokit.com" \
  --user-attributes \
    Name=email,Value=demo@junokit.com \
    Name=given_name,Value=Demo \
    Name=family_name,Value=User \
  --temporary-password "TempPass123!" \
  --message-action SUPPRESS \
  --region "$REGION"

aws cognito-idp admin-set-user-password \
  --user-pool-id "$USER_POOL_ID" \
  --username "demo@junokit.com" \
  --password "Demo2024!" \
  --permanent \
  --region "$REGION"

echo "✅ Demo user created too!"
echo ""
echo "🔑 Demo login credentials:"
echo "Email: demo@junokit.com"
echo "Password: Demo2024!" 