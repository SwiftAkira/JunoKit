# 🏗️ Junokit Infrastructure Overview

*AWS CDK Infrastructure in Stockholm Region (eu-north-1)*

---

## 🌍 **Region & Compliance**

**Location**: Stockholm, Sweden (`eu-north-1`)
- ✅ **GDPR Compliant** - EU region for data sovereignty
- 💰 **Cost Optimized** - Cheapest AWS region for EU compliance
- ⚡ **Low Latency** - Good performance for European users

---

## 📊 **Core Infrastructure Components**

### 🗄️ **DynamoDB - User Context & Memory**
```
Table Name: junokit-user-context
Partition Key: userId (String)
Sort Key: contextType (String)
```

**Features:**
- ✅ Pay-per-request billing (cost-effective for MVP)
- ✅ Point-in-time recovery for data protection
- ✅ AWS-managed encryption
- ✅ TTL for ephemeral data cleanup
- ✅ Global Secondary Index on contextType

**Data Types Stored:**
- User conversation history
- AI context and memory
- User preferences and settings
- Session data (temporary)

### 🔐 **Cognito User Pool - Authentication**
```
Pool Name: junokit-users
Domain: junokit.com
```

**Configuration:**
- ✅ **Invite-only** registration (no self-signup)
- ✅ Email-based authentication
- ✅ Custom attributes: inviteCode, userRole, theme
- ✅ Strong password policy
- ✅ 30-day refresh tokens, 1-hour access tokens

**Custom Attributes:**
- `inviteCode` - Unique invitation identifier
- `userRole` - Admin vs regular user
- `theme` - UI theme preference (Dev, Ops, QA, Sales, Media)

### 🌐 **API Gateway - REST API**
```
API Name: junokit-api
Stage: v1
Base URL: https://[api-id].execute-api.eu-north-1.amazonaws.com/v1
```

**Features:**
- ✅ CORS enabled for web frontend
- ✅ Rate limiting (1000 req/sec, 2000 burst)
- ✅ Request/response logging
- ✅ CloudWatch metrics
- ✅ Throttling protection

### 📧 **SES Email Service**
```
Domain: junokit.com
Purpose: Notifications, reminders, system emails
```

**Configuration:**
- ✅ Email identity for junokit.com
- ✅ Feedback forwarding enabled
- ✅ Ready for notification system

### 🔑 **Secrets Manager - API Keys**
```
Secret Name: junokit-api-secrets
```

**Stored Secrets:**
- OpenRouter API key (AI service)
- Slack bot token
- GitHub token  
- Google OAuth credentials
- Other third-party API keys

---

## 📤 **CDK Outputs**

The infrastructure exports these values for use by frontend and Lambda functions:

```typescript
// Available as CDK exports
JunokitUserPoolId          // Cognito User Pool ID
JunokitUserPoolClientId    // Cognito Client ID  
JunokitApiUrl             // API Gateway base URL
JunokitUserContextTable   // DynamoDB table name
JunokitApiSecretsArn      // Secrets Manager ARN
```

---

## 🛡️ **Security Features**

### **Data Protection**
- ✅ All data encrypted at rest (AWS managed keys)
- ✅ DynamoDB point-in-time recovery
- ✅ Cognito user pool retention policy
- ✅ Secrets in AWS Secrets Manager (not hardcoded)

### **Access Control**
- ✅ Invite-only user registration
- ✅ JWT-based authentication
- ✅ API Gateway throttling
- ✅ CORS properly configured

### **GDPR Compliance**
- ✅ EU region data storage
- ✅ TTL for ephemeral data
- ✅ User account recovery via email
- ✅ Data retention policies

---

## 💰 **Cost Optimization**

### **Pay-Per-Use Services**
- 📊 **DynamoDB**: Pay per request (no idle costs)
- 🌐 **API Gateway**: Pay per API call
- 🔐 **Cognito**: Pay per user (free tier: 50,000 MAU)
- 📧 **SES**: Pay per email sent

### **Cost Monitoring**
- ✅ All resources tagged for cost tracking
- ✅ Stockholm region (cheapest EU option)
- ✅ No over-provisioned resources

---

## 🚀 **Deployment Commands**

### **Prerequisites**
```bash
# Install AWS CLI
brew install awscli

# Configure AWS CLI for Stockholm
aws configure
# Region: eu-north-1
# Output: json
```

### **CDK Commands**
```bash
cd infrastructure/aws-cdk

# Install dependencies
npm install

# Build TypeScript
npm run build

# Test synthesis
npx cdk synth

# Deploy infrastructure
npx cdk deploy

# Check differences
npx cdk diff

# Destroy (if needed)
npx cdk destroy
```

---

## 🔧 **Development Workflow**

### **Local Development**
1. CDK synthesizes CloudFormation templates
2. Deploy to AWS Stockholm region
3. Frontend connects to deployed API Gateway
4. Lambda functions use DynamoDB and Secrets Manager

### **Environment Variables**
Frontend will need these from CDK outputs:
```typescript
NEXT_PUBLIC_USER_POOL_ID=<from CDK output>
NEXT_PUBLIC_USER_POOL_CLIENT_ID=<from CDK output>
NEXT_PUBLIC_API_URL=<from CDK output>
NEXT_PUBLIC_REGION=eu-north-1
```

---

## 📈 **Scaling Considerations**

### **Current Capacity**
- 📊 DynamoDB: Auto-scaling pay-per-request
- 🌐 API Gateway: 1000 req/sec (can increase)
- 🔐 Cognito: 50,000 MAU free tier
- 📧 SES: 200 emails/day free tier

### **Growth Path**
- **5-100 users**: Current setup perfect
- **100-1000 users**: Increase API Gateway limits
- **1000+ users**: Consider Aurora Serverless for complex queries

---

## ⚠️ **Important Notes**

### **Domain Configuration**
- ✅ Infrastructure assumes `junokit.com` domain
- ⚠️ SES domain verification required before email sending
- ⚠️ Custom domain for API Gateway (optional)

### **Manual Steps Required**
1. **AWS CLI Configuration** - Set up Stockholm region
2. **Domain Verification** - Verify junokit.com in SES
3. **Secret Values** - Add actual API keys to Secrets Manager
4. **DNS Configuration** - Point domain to infrastructure

---

## 🎯 **Next Steps**

1. **Deploy Infrastructure**: Run `cdk deploy` 
2. **Configure Domain**: Verify junokit.com in SES
3. **Add API Keys**: Update Secrets Manager with real values
4. **Frontend Integration**: Use CDK outputs in Next.js app
5. **Lambda Functions**: Build AI and integration functions

---

*Infrastructure ready for Phase 3: Frontend Development!* 🚀 