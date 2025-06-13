# 🚀 **JunoKit AWS Amplify Gen 2 Deployment**

## **Overview**
Deploy JunoKit to `https://junokit.com` using AWS Amplify Gen 2 - the modern, scalable, code-first approach.

**Why Amplify Gen 2?**
- ✅ **Code-first configuration** - Everything in TypeScript
- ✅ **Auto-scaling** - Handle millions of users
- ✅ **Full-stack TypeScript** - End-to-end type safety
- ✅ **Built-in CI/CD** - Automatic deployments from Git
- ✅ **Global CDN** - Fast worldwide performance
- ✅ **Enterprise security** - Built-in authentication and authorization

---

## **🎯 Current Status**

✅ **Backend Deployed**: Your Amplify sandbox is running
- **Region**: eu-north-1 (Stockholm)
- **Stack**: amplify-frontend-orion-sandbox-b05fc4d293
- **AppSync API**: https://f2mto5tjuffy7lusj3qorh3ih4.appsync-api.eu-north-1.amazonaws.com/graphql

✅ **Frontend Built**: Production build successful
✅ **Domain Purchased**: junokit.com ready to use

---

## **📋 Step-by-Step Deployment**

### **Step 1: Create Amplify App via Console**

1. **Open AWS Amplify Console**
   ```
   https://console.aws.amazon.com/amplify/
   ```

2. **Create New App**
   - Click "Create new app"
   - Choose "Host web app"
   - Select "Deploy without Git provider" (for now)

3. **Upload Build**
   ```bash
   # From your frontend directory
   cd /Users/orion/Documents/JunoKit/frontend
   
   # Create deployment package
   npm run build
   zip -r junokit-build.zip .next/ public/ package.json next.config.ts
   ```

4. **Configure App**
   - **App name**: JunoKit
   - **Environment**: production
   - **Region**: eu-north-1 (Stockholm)

### **Step 2: Connect to GitHub (Recommended)**

1. **Push to GitHub** (if not already done)
   ```bash
   cd /Users/orion/Documents/JunoKit
   git add .
   git commit -m "Production ready with Amplify Gen 2"
   git push origin main
   ```

2. **Connect Repository**
   - In Amplify Console: "Host web app" → "GitHub"
   - Authorize GitHub access
   - Select your JunoKit repository
   - Choose `main` branch
   - Set build folder: `frontend`

3. **Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - cd frontend
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: frontend/.next
       files:
         - '**/*'
     cache:
       paths:
         - frontend/node_modules/**/*
   ```

### **Step 3: Environment Variables**

In Amplify Console → App Settings → Environment Variables:

```
NEXT_PUBLIC_AWS_REGION=eu-north-1
NEXT_PUBLIC_USER_POOL_ID=eu-north-1_QUaZ7e7OU
NEXT_PUBLIC_USER_POOL_CLIENT_ID=66ako4srqdk2aghompd956bloa
NEXT_PUBLIC_API_URL=https://nayr2j5df2.execute-api.eu-north-1.amazonaws.com/v1
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_APP_URL=https://junokit.com
NEXT_PUBLIC_ENABLE_SLACK_INTEGRATION=true
NEXT_PUBLIC_ENABLE_VOICE_INPUT=true
NEXT_PUBLIC_ENABLE_FILE_UPLOAD=true
```

### **Step 4: Custom Domain Setup**

1. **Add Domain**
   - Go to App Settings → Domain management
   - Click "Add domain"
   - Enter: `junokit.com`

2. **Domain Configuration**
   - **Root domain**: `junokit.com` → main branch
   - **Subdomain**: `www.junokit.com` → redirect to root
   - **SSL Certificate**: Auto-provisioned by Amplify

3. **DNS Configuration**
   - Copy the DNS records from Amplify
   - Add them to your domain registrar:
     ```
     Type: CNAME
     Name: www
     Value: [amplify-provided-value]
     
     Type: ANAME/ALIAS
     Name: @
     Value: [amplify-provided-value]
     ```

---

## **⚡ Quick Deployment (Alternative)**

If you want to deploy immediately while DNS propagates:

### **Option A: Manual Upload**

```bash
cd frontend
npm run build
zip -r junokit-production.zip .next/ public/ package.json
# Upload this zip file in Amplify Console
```

### **Option B: Amplify CLI (Gen 2)**

```bash
# Install dependencies if not done
npm install -g @aws-amplify/cli

# Deploy to production
npx ampx pipeline-deploy --branch main --app-id [YOUR-APP-ID]
```

---

## **🔗 Enable Full Stack Integration**

Your current setup has:
- ✅ **Existing AWS Backend** - Lambda + API Gateway + DynamoDB
- ✅ **New Amplify Gen 2 Backend** - AppSync + Additional services
- ✅ **Frontend** - Next.js with both integrations

### **Connecting Both Backends**

Update your frontend to use both:

```typescript
// src/lib/aws-config.ts
import { Amplify } from 'aws-amplify';
import amplifyOutputs from '../amplify_outputs.json';

// Configure Amplify Gen 2
Amplify.configure(amplifyOutputs);

// Keep existing API Gateway configuration
export const existingAPI = {
  endpoint: 'https://nayr2j5df2.execute-api.eu-north-1.amazonaws.com/v1',
  region: 'eu-north-1',
  userPoolId: 'eu-north-1_QUaZ7e7OU',
  userPoolClientId: '66ako4srqdk2aghompd956bloa'
};
```

---

## **🎯 Post-Deployment Checklist**

### **✅ Immediate Tests**
- [ ] `https://junokit.com` loads with SSL
- [ ] Login/signup works with Cognito
- [ ] AI chat system functional
- [ ] Slack integration OAuth works
- [ ] All pages load correctly
- [ ] Mobile responsive design works

### **✅ Slack Integration Update**
Once HTTPS is live:
1. Go to https://api.slack.com/apps
2. Select your JunoKit app
3. Update redirect URL to: `https://junokit.com/integrations/slack/callback`
4. Test OAuth flow

### **✅ Performance Optimization**
- [ ] Enable CloudFront compression
- [ ] Configure caching headers
- [ ] Set up monitoring and alerts
- [ ] Run Lighthouse audit

---

## **📊 Scaling Features**

With Amplify Gen 2, you get:

### **Auto-Scaling**
- **Frontend**: Automatic CDN scaling
- **Backend**: Serverless auto-scaling
- **Database**: DynamoDB on-demand scaling
- **Storage**: Unlimited S3 storage

### **Enterprise Features**
- **CI/CD**: Automatic deployments from Git
- **Branch deployments**: Feature branch previews
- **Monitoring**: Built-in CloudWatch integration
- **Security**: WAF, DDoS protection, SSL certificates

### **Multi-Environment**
```bash
# Create staging environment
npx ampx sandbox --identifier staging

# Create production environment
npx ampx pipeline-deploy --branch main --app-id [APP-ID]
```

---

## **🚨 Common Issues & Solutions**

### **Build Failures**
```bash
# Clear cache and rebuild
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### **Environment Variables Not Loading**
- Check Amplify Console → Environment Variables
- Ensure `NEXT_PUBLIC_` prefix for client-side vars
- Redeploy after adding variables

### **Custom Domain Issues**
- DNS propagation takes 24-48 hours
- Check DNS with: `nslookup junokit.com`
- SSL certificate auto-provisions in 5-10 minutes

### **API CORS Errors**
Your existing API Gateway is already configured for `https://junokit.com` ✅

---

## **🎉 Expected Results**

**Within 24-48 hours:**
- ✅ **https://junokit.com** - Live and secure
- ✅ **Auto-scaling infrastructure** - Handle millions of users
- ✅ **Full Slack integration** - OAuth working perfectly
- ✅ **Enterprise-grade security** - SSL, WAF, DDoS protection
- ✅ **Global performance** - CDN in 400+ edge locations
- ✅ **Automatic deployments** - Git push triggers deployment

**💰 Cost Estimate:**
- **Amplify Hosting**: $1/month for build minutes + $0.15/GB served
- **Existing AWS Backend**: $5-15/month (unchanged)
- **Total**: ~$6-16/month for production-ready enterprise app

**🎯 Ready to scale to millions of users!** 🚀 