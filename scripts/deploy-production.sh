#!/bin/bash

# 🚀 JunoKit Production Deployment Script
# This script automates the deployment to https://junokit.com

set -e  # Exit on any error

echo "🚀 Starting JunoKit Production Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the JunoKit root directory"
    exit 1
fi

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Deployment Checklist:${NC}"
echo "  ✅ Domain purchased: junokit.com"
echo "  ✅ AWS infrastructure deployed"
echo "  ✅ Frontend code ready"
echo ""

# Step 1: Update API Gateway CORS
echo -e "${YELLOW}🔧 Step 1: Updating API Gateway CORS settings...${NC}"
cd infrastructure/aws-cdk
echo "Deploying updated CORS settings to allow https://junokit.com..."
npx cdk deploy --require-approval never

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ CORS settings updated successfully${NC}"
else
    echo -e "${RED}❌ Failed to update CORS settings${NC}"
    exit 1
fi

cd ../..

# Step 2: Prepare Frontend
echo -e "${YELLOW}🔧 Step 2: Preparing frontend for production...${NC}"
cd frontend

# Copy production environment
echo "Copying production environment variables..."
cp ../config/production.env .env.production

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the application
echo "Building production application..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend built successfully${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

cd ..

# Step 3: Deployment options
echo -e "${BLUE}📦 Step 3: Choose deployment method:${NC}"
echo "1. Deploy with Vercel (recommended for speed)"
echo "2. Deploy with AWS Amplify (recommended for AWS integration)"
echo "3. Manual deployment (advanced users)"
echo ""

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo -e "${YELLOW}🚀 Deploying with Vercel...${NC}"
        
        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm install -g vercel
        fi
        
        cd frontend
        echo "Deploying to Vercel..."
        vercel --prod --yes
        
        echo -e "${GREEN}✅ Vercel deployment initiated!${NC}"
        echo -e "${BLUE}📝 Next steps:${NC}"
        echo "  1. Go to Vercel dashboard"
        echo "  2. Add custom domain: junokit.com"
        echo "  3. Configure DNS records as shown in Vercel"
        echo "  4. Wait for SSL certificate to activate"
        ;;
        
    2)
        echo -e "${YELLOW}🚀 Deploying with AWS Amplify...${NC}"
        
        # Check if Amplify CLI is installed
        if ! command -v amplify &> /dev/null; then
            echo "Installing Amplify CLI..."
            npm install -g @aws-amplify/cli
        fi
        
        cd frontend
        echo "Initializing Amplify (if not already done)..."
        
        if [ ! -f "amplify/.config/project-config.json" ]; then
            echo "Run 'amplify init' to set up Amplify, then run this script again."
            exit 1
        fi
        
        echo "Adding hosting..."
        amplify add hosting
        
        echo "Publishing to Amplify..."
        amplify publish
        
        echo -e "${GREEN}✅ Amplify deployment initiated!${NC}"
        echo -e "${BLUE}📝 Next steps:${NC}"
        echo "  1. Go to AWS Amplify Console"
        echo "  2. Add custom domain: junokit.com"
        echo "  3. Configure DNS records as shown in Amplify"
        echo "  4. Wait for SSL certificate to activate"
        ;;
        
    3)
        echo -e "${YELLOW}📁 Manual deployment selected${NC}"
        echo -e "${BLUE}📝 Manual deployment steps:${NC}"
        echo "  1. Upload frontend/.next/* to your hosting provider"
        echo "  2. Configure environment variables from config/production.env"
        echo "  3. Set up SSL certificate for junokit.com"
        echo "  4. Configure DNS records to point to your hosting"
        ;;
        
    *)
        echo -e "${RED}❌ Invalid choice. Please run the script again.${NC}"
        exit 1
        ;;
esac

# Step 4: Post-deployment instructions
echo ""
echo -e "${GREEN}🎉 Deployment process initiated!${NC}"
echo -e "${BLUE}📝 Post-deployment checklist:${NC}"
echo ""
echo "  ⏳ Wait for DNS propagation (up to 48 hours)"
echo "  ⏳ Wait for SSL certificate activation (5-10 minutes)"
echo ""
echo "  🔗 Once https://junokit.com is live:"
echo "    1. Test login/signup functionality"
echo "    2. Test AI chat system"
echo "    3. Update Slack app redirect URL to:"
echo "       https://junokit.com/integrations/slack/callback"
echo "    4. Test Slack integration OAuth flow"
echo ""
echo "  📊 Monitor deployment status:"
echo "    - DNS: nslookup junokit.com"
echo "    - SSL: https://www.ssllabs.com/ssltest/"
echo "    - Performance: https://pagespeed.web.dev/"
echo ""

# Step 5: Slack integration preparation
echo -e "${YELLOW}🔧 Step 5: Preparing Slack integration...${NC}"
echo "When your domain is live, update your Slack app:"
echo "  1. Go to: https://api.slack.com/apps"
echo "  2. Select your JunoKit app"
echo "  3. Go to 'OAuth & Permissions'"
echo "  4. Update Redirect URLs to:"
echo "     https://junokit.com/integrations/slack/callback"
echo "  5. Save changes"
echo ""

echo -e "${GREEN}✅ Production deployment script completed!${NC}"
echo "🎯 Next: Wait for domain to propagate, then test at https://junokit.com"

# Optional: Open relevant URLs
if command -v open &> /dev/null; then
    echo "Opening relevant URLs..."
    open "https://junokit.com" 2>/dev/null || true
    open "https://api.slack.com/apps" 2>/dev/null || true
fi 