# ⚡ **JunoKit HTTPS Deployment - Quick Start**

## 🎯 **Your Mission**
Deploy JunoKit to `https://junokit.com` and unlock full Slack integration!

---

## **📋 Pre-Flight Checklist**
- ✅ **Domain**: Purchase `junokit.com`
- ✅ **AWS Infrastructure**: Already deployed and running
- ✅ **Backend API**: Live at `https://nayr2j5df2.execute-api.eu-north-1.amazonaws.com/v1`
- ✅ **Frontend**: Built and tested locally
- ✅ **Slack Integration**: Ready for HTTPS OAuth

---

## **🚀 Two-Step Deployment**

### **Step 1: Buy Domain**
```bash
# Buy junokit.com from any registrar:
# - GoDaddy, Namecheap, AWS Route 53, etc.
# - Choose annual registration
# - Consider privacy protection
```

### **Step 2: Deploy (Choose One)**

#### **Option A: Vercel (Fastest - 10 minutes)** ⭐ **RECOMMENDED**
```bash
# From JunoKit root directory:
./scripts/deploy-production.sh
# Choose option 1 (Vercel)
```

#### **Option B: AWS Amplify (Best AWS Integration)**
```bash
# From JunoKit root directory:
./scripts/deploy-production.sh  
# Choose option 2 (Amplify)
```

---

## **⏱️ Timeline Expectations**

| Task | Time | What Happens |
|------|------|--------------|
| Domain Purchase | 5 minutes | You own junokit.com |
| Deployment Script | 5-15 minutes | App deployed to temp URL |
| Domain Connection | 5 minutes | Point domain to deployment |
| DNS Propagation | 2-48 hours | junokit.com goes live |
| SSL Activation | 5-10 minutes | HTTPS becomes available |
| **Total** | **2-48 hours** | **https://junokit.com live!** |

---

## **🎉 Success Indicators**

### **When It's Working:**
1. ✅ `https://junokit.com` loads securely (green lock icon)
2. ✅ Login/signup works with your AWS Cognito
3. ✅ AI chat responds with real conversations
4. ✅ Slack integration OAuth flow completes
5. ✅ All features work exactly like localhost

### **Immediate Benefits:**
- 🔗 **Full Slack Integration** - OAuth flow now works
- 🌐 **Professional URL** - Share with users/investors
- 🔒 **Enterprise Security** - SSL certificates and HTTPS
- ⚡ **Global CDN** - Fast loading worldwide
- 📱 **Mobile Ready** - Works perfectly on phones

---

## **🔧 Post-Deployment Tasks (5 minutes)**

### **1. Update Slack App**
```
1. Go to: https://api.slack.com/apps
2. Select your JunoKit app
3. OAuth & Permissions → Redirect URLs
4. Change to: https://junokit.com/integrations/slack/callback
5. Save
```

### **2. Test Everything**
```
✅ Visit https://junokit.com
✅ Create account / Login
✅ Start AI chat conversation
✅ Test voice input
✅ Connect to Slack
✅ Send test Slack message
```

---

## **🆘 If Something Goes Wrong**

### **Domain Not Working**
```bash
# Check DNS propagation
nslookup junokit.com

# Usually just needs time (up to 48 hours)
```

### **HTTPS Not Working**
```bash
# Check SSL certificate status
curl -I https://junokit.com

# Usually auto-fixes in 5-10 minutes
```

### **API Errors**
```bash
# CORS already updated for junokit.com
# If issues, redeploy backend:
cd infrastructure/aws-cdk
npx cdk deploy
```

### **Slack OAuth Fails**
```bash
# Ensure exact URL match in Slack app:
# https://junokit.com/integrations/slack/callback
```

---

## **📞 Ready to Deploy?**

**Right now, you can:**
1. Buy `junokit.com` (5 minutes)
2. Run `./scripts/deploy-production.sh` (choose Vercel)
3. Connect domain in Vercel dashboard (5 minutes)
4. Wait for DNS + SSL (2-48 hours)
5. Update Slack app redirect URL (2 minutes)
6. **You're live!** 🎉

**Total hands-on time: ~20 minutes**
**Total waiting time: 2-48 hours for DNS**

---

## **💡 Pro Tips**

- **Use Vercel for fastest deployment** (literally 10 minutes to live)
- **DNS usually propagates in 2-6 hours** (not the full 48)
- **Test on mobile immediately** - your users expect it to work
- **Screenshot the working Slack integration** - great for demos!
- **Consider analytics** (Google Analytics, Hotjar) while you're at it

**🎯 Goal: JunoKit live on HTTPS, Slack working, ready for users!** 