# 🚀 Junokit Setup Guide

## Quick Setup for CDK Deployment

### 1. Install Node.js (Choose One Method)

#### Option A: Homebrew (Recommended for macOS)
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Verify installation
node --version
npm --version
```

#### Option B: Node Version Manager (nvm)
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or reload profile
source ~/.zshrc

# Install latest LTS Node.js
nvm install --lts
nvm use --lts

# Verify installation
node --version
npm --version
```

#### Option C: Direct Download
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the LTS version
3. Install the package
4. Verify in terminal: `node --version`

### 2. Deploy Infrastructure

Once Node.js is installed, run our automated deployment script:

```bash
# From the project root directory
./scripts/deploy-infrastructure.sh
```

This script will:
- ✅ Check all prerequisites (Node.js, npm, AWS CLI)
- ✅ Install AWS CDK globally if needed
- ✅ Install all project dependencies
- ✅ Build TypeScript code
- ✅ Bootstrap CDK if needed
- ✅ Show deployment diff
- ✅ Deploy the infrastructure
- ✅ Update configuration files

### 3. What Gets Deployed

The deployment will create/update:

#### **Lambda Function**
- `junokit-user-profile` - Handles user profile operations
- JWT token verification with Cognito
- DynamoDB integration for user data

#### **API Gateway Routes**
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile
- Both protected with Cognito authorization

#### **DynamoDB Table**
- Updated structure for user profiles
- Simplified schema (removed sort key)

#### **Cognito Integration**
- API Gateway authorizers
- JWT token validation

### 4. After Deployment

#### Test the Setup
```bash
# Start the frontend development server
cd frontend
npm run dev
```

#### Create Demo User
```bash
# Create a test user in Cognito
aws cognito-idp admin-create-user \
  --user-pool-id $(grep userPoolId config/aws-outputs.json | cut -d'"' -f4) \
  --username demo@junokit.com \
  --user-attributes Name=email,Value=demo@junokit.com Name=given_name,Value=Demo Name=family_name,Value=User \
  --temporary-password TempPass123! \
  --message-action SUPPRESS

# Set permanent password
aws cognito-idp admin-set-user-password \
  --user-pool-id $(grep userPoolId config/aws-outputs.json | cut -d'"' -f4) \
  --username demo@junokit.com \
  --password TempPass123! \
  --permanent
```

### 5. Troubleshooting

#### Common Issues

**Node.js not found after installation:**
```bash
# Restart terminal or reload shell
source ~/.zshrc
# or
source ~/.bash_profile
```

**CDK bootstrap error:**
```bash
# Manually bootstrap CDK
cdk bootstrap aws://YOUR_ACCOUNT_ID/eu-north-1
```

**Permission errors:**
```bash
# Check AWS credentials
aws sts get-caller-identity

# Verify region
aws configure get region
```

**Lambda deployment fails:**
```bash
# Check if dependencies are installed
cd backend/layers/shared/nodejs
npm install
cd ../../../../
```

### 6. Verification

After successful deployment, you should see:

1. **Lambda Function**: `junokit-user-profile` in AWS Console
2. **API Gateway**: New `/user/profile` routes
3. **Updated Config**: `config/aws-outputs.json` with new endpoints
4. **Working Frontend**: Authentication flow with real AWS services

### 7. Next Steps

Once deployment is complete:

1. **Test Authentication**: Try login/signup flows
2. **Verify API**: Check user profile endpoints
3. **Create Users**: Add demo accounts for testing
4. **AI Integration**: Continue with Phase 4 Step 3

---

## Manual Installation (Alternative)

If the automated script doesn't work, you can install manually:

```bash
# 1. Install Node.js (see options above)

# 2. Install CDK globally
npm install -g aws-cdk

# 3. Install backend dependencies
cd backend/layers/shared/nodejs
npm install
cd ../../../../

# 4. Install CDK dependencies
cd infrastructure/aws-cdk
npm install

# 5. Build TypeScript
npm run build

# 6. Bootstrap CDK (if needed)
cdk bootstrap

# 7. Deploy
cdk deploy

# 8. Update config manually from CloudFormation outputs
```

---

**Ready to deploy?** Run: `./scripts/deploy-infrastructure.sh` 🚀 