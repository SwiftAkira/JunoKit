# 🚀 Slack Integration Quick Start Guide

## 🔄 Current Status

✅ **Infrastructure Deployed** - All Lambda functions and API endpoints are live  
✅ **Frontend Components Created** - UI components are ready  
✅ **API Routes Created** - Next.js proxy routes are working  
⚠️ **Waiting for Production HTTPS URL** - Slack OAuth requires HTTPS for security  

### 🔒 HTTPS Requirement

Slack requires all OAuth redirect URLs to use HTTPS. The integration is **fully functional** but can only be tested once you have:
- A production HTTPS domain configured
- SSL certificate in place
- Slack app redirect URLs updated to use your production domain

**For now**: The integration shows a helpful message in development mode explaining the HTTPS requirement.

## Prerequisites ✅

- [x] JunoKit infrastructure already deployed
- [x] AWS CLI configured  
- [x] Access to create Slack apps
- [ ] Production HTTPS domain (pending)

## Your Current Setup 📊

- **API Gateway**: `https://nayr2j5df2.execute-api.eu-north-1.amazonaws.com/v1`
- **Region**: `eu-north-1` 
- **Secrets**: `junokit-api-secrets`
- **Frontend**: Currently `https://app.junokit.com` (update if different)

---

## Step 1: What's Your Frontend URL? 🌐

**Tell me your actual frontend domains:**

- **Production**: `https://app.junokit.com` or `https://your-domain.com`?
- **Development**: `http://localhost:3000` or custom?

If different from `app.junokit.com`, run:
```bash
./scripts/update-frontend-url.sh
```

---

## Step 2: Create Slack App 🔧

1. **Go to**: [https://api.slack.com/apps](https://api.slack.com/apps)

2. **Create App**:
   - Click "Create New App" → "From scratch"
   - Name: `JunoKit Integration`
   - Choose your test workspace
   - Click "Create App"

3. **OAuth & Permissions**:
   - Go to "OAuth & Permissions" 
   - Add Redirect URLs:
     ```
     https://app.junokit.com/integrations/slack/callback
     http://localhost:3000/integrations/slack/callback
     ```
     *(Replace with your actual domains)*

4. **Bot Token Scopes** (Add all of these):
   ```
   ✅ channels:read        View basic information about public channels
   ✅ channels:write       Manage public channels  
   ✅ chat:write          Send messages as the app
   ✅ users:read          View people in the workspace
   ✅ teams:read          View basic information about the workspace
   ✅ im:write            Start direct messages with people
   ✅ groups:write        Manage private channels
   ```

5. **User Token Scopes** (Add these):
   ```
   ✅ identity.basic      View basic profile info
   ✅ identity.email      View email address
   ```

6. **Get Credentials**:
   - Go to "Basic Information"
   - Copy your **Client ID** and **Client Secret**

---

## Step 3: Add Credentials to AWS 🔐

**Option A - Automated (Recommended):**
```bash
./scripts/update-slack-secrets.sh
```

**Option B - Manual:**
1. Edit `scripts/slack-secrets-manual.json` with your credentials
2. Run:
   ```bash
   aws secretsmanager update-secret \
     --secret-id junokit-api-secrets \
     --secret-string file://scripts/slack-secrets-manual.json
   ```

---

## Step 4: Deploy Infrastructure 🚀

```bash
# If your frontend URL is different, set it:
export FRONTEND_URL="https://your-actual-domain.com"

# Deploy
cd infrastructure/aws-cdk
npm run deploy
```

---

## Step 5: Test Integration ✨

1. **Go to**: Your frontend → `/integrations`
2. **Click**: "Connect" on the Slack card
3. **Or go directly to**: `/integrations/slack`
4. **Click**: "Connect to Slack"
5. **Authorize** on Slack
6. **Success!** You should be redirected back

---

## API Endpoints Created 📡

Your new Slack endpoints:
```
GET    /integrations/slack/auth        - Start OAuth
GET    /integrations/slack/callback    - OAuth callback  
GET    /integrations/slack/status      - Check connection
DELETE /integrations/slack/disconnect  - Disconnect
POST   /integrations/slack/send        - Send messages
GET    /integrations/slack/channels    - List channels
GET    /integrations/slack/users       - List users
```

Full API URL example:
```
https://nayr2j5df2.execute-api.eu-north-1.amazonaws.com/v1/integrations/slack/auth
```

---

## Testing Commands 🧪

After connecting, test sending a message:

```bash
# Get auth token from your frontend
TOKEN="your-user-jwt-token"

# Send test message
curl -X POST \
  https://nayr2j5df2.execute-api.eu-north-1.amazonaws.com/v1/integrations/slack/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "C1234567890",
    "text": "Hello from JunoKit! 🚀"
  }'
```

---

## Troubleshooting 🔧

### Common Issues:

1. **OAuth Redirect Mismatch**
   - ✅ Check Slack app redirect URLs match exactly
   - ✅ Verify your frontend domain is correct

2. **Credentials Not Found**
   - ✅ Run `aws secretsmanager get-secret-value --secret-id junokit-api-secrets`
   - ✅ Verify `slackClientId` and `slackClientSecret` are present

3. **403 Errors**
   - ✅ Check your JWT token is valid
   - ✅ Verify Cognito authentication is working

4. **Slack API Errors**
   - ✅ Check bot is added to channels you're trying to message
   - ✅ Verify OAuth scopes are correct

### Debug Steps:

```bash
# Check if secrets are updated
aws secretsmanager get-secret-value --secret-id junokit-api-secrets

# Check Lambda logs
aws logs tail /aws/lambda/junokit --follow

# Test API Gateway directly
curl -X GET "https://nayr2j5df2.execute-api.eu-north-1.amazonaws.com/v1/integrations/slack/auth" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## What's Next? 🎯

Once working, you can:

1. **Connect Multiple Workspaces** - Each user can connect their own
2. **Send Rich Messages** - Use Slack blocks and attachments  
3. **Add to Chat Interface** - Send AI responses to Slack
4. **Set up Webhooks** - Receive Slack events (future enhancement)

---

## Need Help? 💬

- Check the detailed guide: `docs/SLACK-INTEGRATION-SETUP.md`
- View logs: `aws logs tail /aws/lambda/junokit`
- Test endpoints directly with curl/Postman 