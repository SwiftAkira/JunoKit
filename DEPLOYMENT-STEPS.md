# 🚀 **Junokit App Runner Deployment Steps**

## **Current Status: Backend Deployed ✅**
Your backend infrastructure is successfully running in Stockholm (eu-north-1) for GDPR compliance.

## **Next: Deploy Frontend with App Runner**

### **Step 1: Update Repository URL**
Edit `infrastructure/aws-cdk/lib/junokit-apprunner-stack.ts` and replace:
```typescript
repositoryUrl: 'https://github.com/your-username/JunoKit',
```
With your actual GitHub repository URL.

### **Step 2: Deploy App Runner Stack**
```bash
cd infrastructure/aws-cdk
npm run cdk -- deploy JunokitAppRunnerStack --require-approval never
```

### **Step 3: Configure CORS (After Deployment)**
Once App Runner is deployed, you'll get a URL like `https://abc123.eu-west-1.awsapprunner.com`

Update your API Gateway CORS settings to include the App Runner URL:
- Go to AWS Console → API Gateway → junokit-api
- Add the App Runner URL to allowed origins

### **Step 4: Test the Application**
- Frontend: Your App Runner URL
- Backend API: `https://nayr2j5df2.execute-api.eu-north-1.amazonaws.com/v1/`
- Authentication: Cognito User Pool `eu-north-1_QUaZ7e7OU`

## **Architecture Overview**
```
Frontend (App Runner - Ireland) → Backend API (Stockholm)
├── Static hosting with auto-deployment from GitHub
├── Environment variables configured
└── HTTPS enabled automatically

Backend (Stockholm - GDPR Compliant)
├── DynamoDB: User data and chat messages
├── API Gateway: REST API endpoints
├── Lambda: Chat processing and integrations
├── Cognito: User authentication
└── WebSocket: Real-time features
```

## **Benefits of This Setup**
- ✅ **EU Compliance**: Backend data stays in Stockholm
- ✅ **Performance**: Frontend served from Ireland (closest App Runner region)
- ✅ **Auto-deployment**: GitHub integration for CI/CD
- ✅ **Scalability**: App Runner handles traffic automatically
- ✅ **Cost-effective**: Pay per request model
- ✅ **HTTPS**: SSL certificates managed automatically

## **Cost Estimate**
- **App Runner**: ~$25-50/month for production workload
- **Backend (Stockholm)**: Already deployed and running
- **Total**: Minimal increase from current setup 