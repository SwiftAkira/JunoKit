# 🚀 **JunoKit HTTPS Deployment Guide**

## **Overview**
This guide will help you deploy JunoKit to production HTTPS, unlocking full Slack integration and making the app enterprise-ready.

---

## **🌟 Recommended Approach: AWS Amplify**

**Why Amplify?**
- ✅ Your AWS backend is already deployed
- ✅ Automatic HTTPS with SSL certificates
- ✅ Easy custom domain setup
- ✅ Seamless integration with existing AWS services
- ✅ Built-in CI/CD pipeline
- ✅ Global CDN for fast loading

---

## **📋 Step-by-Step Deployment**

### **1. Domain Setup (After Purchase)**

#### **Option A: Use AWS Route 53 (Recommended)**
```bash
# After buying junokit.com, transfer DNS management to Route 53
# This makes SSL certificate management automatic
```

#### **Option B: Keep Current Registrar**
```bash
# You'll need to add DNS records manually
# Amplify will provide the required CNAME records
```

### **2. Prepare Frontend for Production**

#### **A. Update Environment Variables**
```bash
cd frontend
```

Create production environment file:
```env
# .env.production
NEXT_PUBLIC_AWS_REGION=eu-north-1
NEXT_PUBLIC_USER_POOL_ID=eu-north-1_QUaZ7e7OU
NEXT_PUBLIC_USER_POOL_CLIENT_ID=66ako4srqdk2aghompd956bloa
NEXT_PUBLIC_API_URL=https://nayr2j5df2.execute-api.eu-north-1.amazonaws.com/v1
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_APP_URL=https://junokit.com
```

#### **B. Update CORS Settings**
We need to update your API Gateway to allow your new domain:

```bash
cd infrastructure/aws-cdk
```

### **3. Deploy with AWS Amplify**

#### **A. Install Amplify CLI**
```bash
npm install -g @aws-amplify/cli
amplify configure
```

#### **B. Initialize Amplify in Frontend**
```bash
cd frontend
amplify init
```

Configuration:
- **Project name**: junokit-frontend
- **Environment**: production
- **Default editor**: VS Code
- **App type**: javascript
- **Framework**: react
- **Source directory**: src
- **Build directory**: .next
- **Build command**: npm run build
- **Start command**: npm run start

#### **C. Add Hosting**
```bash
amplify add hosting
```

Choose:
- **Hosting with Amplify Console**: Yes
- **Manual deployment**: Initially, then set up CI/CD

#### **D. Deploy to Amplify**
```bash
amplify publish
```

### **4. Set Up Custom Domain**

#### **A. In AWS Console**
1. Go to AWS Amplify Console
2. Select your app
3. Go to "Domain management"
4. Click "Add domain"
5. Enter: `junokit.com`
6. Set up:
   - **Root domain**: `junokit.com` → Main app
   - **Subdomain**: `www.junokit.com` → Redirect to root

#### **B. SSL Certificate**
- ✅ Amplify automatically provisions SSL certificate
- ✅ Takes 5-10 minutes to activate
- ✅ Auto-renews

### **5. Update API Gateway CORS**

Update your infrastructure to allow the new domain:

```typescript
// In infrastructure/aws-cdk/lib/junokit-infra-stack.ts
defaultCorsPreflightOptions: {
  allowOrigins: [
    'http://localhost:3000',    // Development
    'https://junokit.com',      // Production
    'https://www.junokit.com',  // WWW redirect
  ],
  allowMethods: apigateway.Cors.ALL_METHODS,
  allowHeaders: [
    'Content-Type',
    'X-Amz-Date', 
    'Authorization',
    'X-Api-Key',
    'X-Amz-Security-Token',
  ],
},
```

Redeploy:
```bash
cd infrastructure/aws-cdk
npx cdk deploy
```

---

## **🔗 Enable Slack Integration**

### **1. Update Slack App Configuration**

In your Slack App settings (https://api.slack.com/apps):

#### **OAuth & Permissions**
Update Redirect URLs:
```
https://junokit.com/integrations/slack/callback
```

#### **App Credentials**
Add to AWS Secrets Manager:
```bash
./scripts/update-slack-secrets.sh
```

### **2. Test Slack Integration**

1. Visit `https://junokit.com/integrations/slack`
2. Click "Connect to Slack"
3. Complete OAuth flow
4. Test message sending

---

## **⚡ Alternative: Vercel Deployment (Faster)**

If you want to deploy quickly while domain DNS propagates:

### **1. Install Vercel CLI**
```bash
npm install -g vercel
```

### **2. Deploy Frontend**
```bash
cd frontend
vercel --prod
```

### **3. Add Custom Domain**
```bash
vercel domains add junokit.com
```

### **4. Update Environment**
In Vercel dashboard, add environment variables:
- `NEXT_PUBLIC_AWS_REGION=eu-north-1`
- `NEXT_PUBLIC_USER_POOL_ID=eu-north-1_QUaZ7e7OU`
- `NEXT_PUBLIC_USER_POOL_CLIENT_ID=66ako4srqdk2aghompd956bloa`
- `NEXT_PUBLIC_API_URL=https://nayr2j5df2.execute-api.eu-north-1.amazonaws.com/v1`

---

## **🎯 Post-Deployment Checklist**

### **✅ Immediate Tests**
- [ ] Website loads at `https://junokit.com`
- [ ] SSL certificate shows valid/secure
- [ ] Login/signup works with Cognito
- [ ] AI chat functions with real responses
- [ ] Conversations save and load properly

### **✅ Slack Integration Tests**
- [ ] Slack OAuth flow completes successfully
- [ ] Can send messages to Slack channels
- [ ] Can list Slack channels and users
- [ ] Connection status shows properly
- [ ] Disconnect flow works

### **✅ Production Optimization**
- [ ] Update API Gateway CORS for production domain
- [ ] Configure CloudFront CDN (if using Amplify)
- [ ] Set up monitoring and alerts
- [ ] Test on mobile devices
- [ ] Performance audit with Lighthouse

---

## **📊 Expected Timeline**

| Task | Time | Dependencies |
|------|------|--------------|
| Domain DNS propagation | 24-48 hours | Domain purchase |
| Amplify deployment | 15-30 minutes | DNS ready |
| SSL certificate activation | 5-10 minutes | Domain verified |
| Slack integration testing | 5 minutes | HTTPS live |
| **Total** | **1-2 days** | **Domain ready** |

---

## **🚨 Common Issues & Solutions**

### **DNS Propagation Delays**
- **Issue**: Domain not resolving immediately
- **Solution**: Wait 24-48 hours, check with `nslookup junokit.com`

### **SSL Certificate Issues**
- **Issue**: Certificate not activating
- **Solution**: Verify domain ownership, check DNS records

### **API CORS Errors**
- **Issue**: Frontend can't reach API
- **Solution**: Update CORS origins in API Gateway, redeploy

### **Slack OAuth Fails**
- **Issue**: Redirect URL not matching
- **Solution**: Ensure exact URL match in Slack app settings

---

## **🎉 Success Criteria**

When deployment is complete, you'll have:
- ✅ **Production HTTPS URL**: `https://junokit.com`
- ✅ **Full Slack Integration**: OAuth flow working
- ✅ **Enterprise Ready**: SSL, GDPR compliant, fast CDN
- ✅ **Scalable Infrastructure**: Auto-scaling frontend + serverless backend
- ✅ **Professional Appearance**: Custom domain, SSL certificate

**Ready to unlock the full power of JunoKit! 🚀** 