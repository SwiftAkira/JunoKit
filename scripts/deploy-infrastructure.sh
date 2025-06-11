#!/bin/bash

# Junokit Infrastructure Deployment Script
# This script deploys the updated CDK infrastructure with Lambda functions

set -e  # Exit on any error

echo "🚀 Junokit Infrastructure Deployment"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "scripts/deploy-infrastructure.sh" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Check AWS CLI configuration
echo "📋 Checking AWS configuration..."
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region)
echo "✅ AWS Account: $ACCOUNT_ID"
echo "✅ Region: $REGION"

# Check Node.js and npm
echo "📋 Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm first"
    exit 1
fi

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo "✅ Node.js: $NODE_VERSION"
echo "✅ npm: $NPM_VERSION"

# Check CDK installation
echo "📋 Checking AWS CDK installation..."
if ! command -v cdk &> /dev/null; then
    echo "⚠️  CDK not found. Installing globally..."
    npm install -g aws-cdk
fi

CDK_VERSION=$(cdk --version)
echo "✅ CDK: $CDK_VERSION"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend/layers/shared/nodejs
if [ ! -d "node_modules" ]; then
    echo "Installing Lambda layer dependencies..."
    npm install
else
    echo "Dependencies already installed"
fi
cd ../../../../

# Install CDK dependencies
echo "📦 Installing CDK dependencies..."
cd infrastructure/aws-cdk
if [ ! -d "node_modules" ]; then
    echo "Installing CDK dependencies..."
    npm install
else
    echo "Dependencies already installed"
fi

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Bootstrap CDK (if needed)
echo "🏗️  Checking CDK bootstrap..."
if ! aws cloudformation describe-stacks --stack-name CDKToolkit --region $REGION > /dev/null 2>&1; then
    echo "Bootstrapping CDK..."
    cdk bootstrap aws://$ACCOUNT_ID/$REGION
else
    echo "CDK already bootstrapped"
fi

# Show what will be deployed
echo "📋 Showing deployment diff..."
cdk diff

# Confirm deployment
echo ""
echo "🚨 DEPLOYMENT CONFIRMATION"
echo "=========================="
echo "This will deploy/update the following resources:"
echo "- Lambda function: junokit-user-profile"
echo "- API Gateway routes: /user/profile (GET, PUT)"
echo "- DynamoDB table structure update"
echo "- Cognito authorizers for API endpoints"
echo ""
read -p "Do you want to proceed with deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Deploy the stack
echo "🚀 Deploying infrastructure..."
cdk deploy --require-approval never

# Update config file
echo "📝 Updating configuration..."
cd ../../
aws cloudformation describe-stacks --stack-name JunokitInfraStack --region $REGION --query 'Stacks[0].Outputs' > config/aws-outputs-temp.json

# Parse outputs and update config
python3 -c "
import json
import os

# Read CloudFormation outputs
with open('config/aws-outputs-temp.json', 'r') as f:
    outputs = json.load(f)

# Convert to our config format
config = {
    'region': '$REGION',
    'deployment': {
        'timestamp': '$(date -u +%Y-%m-%dT%H:%M:%SZ)',
        'stackName': 'JunokitInfraStack',
        'stackArn': 'arn:aws:cloudformation:$REGION:$ACCOUNT_ID:stack/JunokitInfraStack/*'
    },
    'outputs': {},
    'environment': {},
    'status': 'DEPLOYED',
    'notes': {
        'deployment': 'Infrastructure successfully updated with Lambda functions',
        'cognito': 'User pool configured for invite-only registration',
        'dynamodb': 'User context table with user profiles',
        'apiGateway': 'REST API with Lambda integration and Cognito auth',
        'lambda': 'User profile Lambda function deployed',
        'secrets': 'API secrets ready for OpenRouter, Slack, GitHub tokens',
        'iam': 'Lambda execution role with required permissions',
        'monitoring': 'CloudWatch log groups created, metrics enabled'
    }
}

# Map CloudFormation outputs to our config
output_mapping = {
    'UserPoolId': 'userPoolId',
    'UserPoolClientId': 'userPoolClientId',
    'ApiGatewayUrl': 'apiGatewayUrl',
    'UserContextTableName': 'userContextTableName',
    'ApiSecretsArn': 'apiSecretsArn',
    'LambdaExecutionRoleArn': 'lambdaExecutionRoleArn',
    'LambdaLogGroupName': 'lambdaLogGroupName'
}

for output in outputs:
    key = output['OutputKey']
    value = output['OutputValue']
    if key in output_mapping:
        config['outputs'][output_mapping[key]] = value

# Set environment variables
config['environment'] = {
    'NEXT_PUBLIC_AWS_REGION': '$REGION',
    'NEXT_PUBLIC_USER_POOL_ID': config['outputs'].get('userPoolId', ''),
    'NEXT_PUBLIC_USER_POOL_CLIENT_ID': config['outputs'].get('userPoolClientId', ''),
    'NEXT_PUBLIC_API_URL': config['outputs'].get('apiGatewayUrl', '').rstrip('/'),
    'AWS_REGION': '$REGION',
    'USER_CONTEXT_TABLE': config['outputs'].get('userContextTableName', ''),
    'API_SECRETS_ARN': config['outputs'].get('apiSecretsArn', ''),
    'LAMBDA_EXECUTION_ROLE_ARN': config['outputs'].get('lambdaExecutionRoleArn', '')
}

# Write final config
with open('config/aws-outputs.json', 'w') as f:
    json.dump(config, f, indent=2)

print('✅ Configuration updated')
"

# Clean up temp file
rm -f config/aws-outputs-temp.json

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================"
echo "✅ Infrastructure deployed successfully"
echo "✅ Lambda function: junokit-user-profile"
echo "✅ API Gateway: $(grep -o 'https://[^"]*' config/aws-outputs.json | head -1)"
echo "✅ Configuration updated: config/aws-outputs.json"
echo ""
echo "🔗 Next Steps:"
echo "1. Test authentication flow with real AWS services"
echo "2. Create demo users in Cognito"
echo "3. Test API endpoints"
echo "4. Continue with AI integration (Phase 4 Step 3)"
echo ""
echo "📋 To test the deployment:"
echo "cd frontend && npm run dev"
echo "" 