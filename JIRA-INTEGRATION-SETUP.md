# 🎯 Jira Integration Setup Guide

## Overview

The Jira integration allows you to connect JunoKit with your Atlassian Jira workspace to manage issues, projects, and track work progress directly from the JunoKit interface.

## 🚀 **Current Status: Ready to Use!**

✅ **Backend Infrastructure**: Deployed to AWS Lambda  
✅ **Frontend Components**: Complete UI with full functionality  
✅ **API Endpoints**: All 8 endpoints operational  
✅ **Authentication**: JWT-based with Cognito integration  
✅ **No HTTPS Required**: Works immediately with API tokens  

## 🔧 Setup Instructions

### 1. Create a Jira API Token

1. Go to [Atlassian Account Security](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click **"Create API token"**
3. Give it a label (e.g., "JunoKit Integration")
4. Copy the generated token - **save it securely!**

### 2. Get Your Jira Domain

Your Jira domain is the part before `.atlassian.net` in your Jira URL.
- If your Jira URL is `https://acme-corp.atlassian.net`, your domain is `acme-corp`

### 3. Connect in JunoKit

1. Navigate to `/integrations` in JunoKit
2. Click on the **Jira** integration card
3. Click **"Connect to Jira"**
4. Fill in the connection form:
   - **Domain**: Your Jira domain (e.g., `acme-corp`)
   - **Email**: Your Atlassian account email
   - **API Token**: The token you created in step 1
5. Click **"Connect"**

## 🎯 Features

### ✅ **Connection Management**
- **Connect**: Securely store your Jira credentials
- **Status Check**: Verify active connections
- **Disconnect**: Remove integration safely

### ✅ **Project Management**
- **View Projects**: Browse all accessible Jira projects
- **Project Details**: See project descriptions and metadata
- **Quick Access**: Click to view project issues

### ✅ **Issue Management**
- **My Issues**: View issues assigned to you
- **Create Issues**: Add new tickets with full details
- **Issue Details**: Expandable views with descriptions
- **Status Tracking**: Visual status indicators and priorities
- **Project Filtering**: Filter issues by project

### ✅ **Search & Discovery**
- **Text Search**: Search across all issues by content
- **Real-time Results**: Instant search with result counts
- **Cross-project Search**: Find issues across all projects

### ✅ **Issue Creation**
- **Full Form**: Project, summary, description, type, priority
- **Issue Types**: Task, Bug, Story, Epic support
- **Priority Levels**: Low, Medium, High, Critical
- **Validation**: Required field checking

## 🔗 API Endpoints

The integration uses these backend endpoints:

- `POST /integrations/jira/connect` - Connect to Jira
- `GET /integrations/jira/status` - Check connection status  
- `DELETE /integrations/jira/disconnect` - Disconnect integration
- `GET /integrations/jira/projects` - Fetch all projects
- `GET /integrations/jira/issues` - Fetch issues (with filters)
- `POST /integrations/jira/issue` - Create new issue
- `PUT /integrations/jira/issue` - Update existing issue
- `GET /integrations/jira/search` - Search issues by text

## 🔐 Security Features

### **Credential Storage**
- **API Tokens**: Encrypted in AWS Secrets Manager
- **User Mapping**: Per-user credential isolation
- **Database**: Connection metadata in DynamoDB

### **Authentication**
- **JWT Verification**: All requests authenticated
- **Cognito Integration**: User identity verification
- **Permission Model**: User-specific access only

### **API Security**
- **HTTPS**: All Jira API calls over secure connections
- **Basic Auth**: Industry-standard Jira authentication
- **Error Handling**: Secure error messages without credential exposure

## 🎨 User Interface

### **Navigation Tabs**
1. **My Issues** - Personal issue dashboard
2. **Projects** - Project browser and management
3. **Search** - Text-based issue discovery
4. **Create Issue** - New ticket creation form

### **Visual Indicators**
- **Status Colors**: Green (done), Blue (in progress), Gray (todo)
- **Priority Colors**: Red (high/critical), Yellow (medium), Green (low)
- **Connection Status**: Clear connected/disconnected states
- **Loading States**: Smooth loading animations

### **Responsive Design**
- **Mobile Friendly**: Works on all screen sizes
- **Grid Layouts**: Adaptive project and issue cards
- **Modal Forms**: Clean connection and creation dialogs

## 🚀 Getting Started

1. **Access**: Navigate to `http://localhost:3000/integrations`
2. **Login**: Make sure you're authenticated in JunoKit
3. **Connect**: Click on Jira and follow the setup steps
4. **Explore**: Try viewing projects, issues, and creating tickets

## 🔄 Next Steps

### **Planned Enhancements**
- **Issue Comments**: Add and view issue comments
- **Attachments**: File upload and download support
- **Workflow Actions**: Status transitions and assignments
- **Advanced Search**: JQL query support
- **Bulk Operations**: Multi-issue management
- **Notifications**: Real-time Jira updates

### **AI Integration**
- **Smart Summaries**: AI-generated issue summaries
- **Template Suggestions**: AI-powered issue templates
- **Priority Recommendations**: AI-assisted priority setting
- **Progress Insights**: AI analysis of project health

## 📊 Current Implementation

- **Backend**: AWS Lambda with TypeScript
- **Frontend**: React with TypeScript
- **API**: REST endpoints with full CRUD support
- **Database**: DynamoDB for connection metadata
- **Security**: AWS Secrets Manager for token storage
- **Region**: Stockholm (eu-north-1) for GDPR compliance

## 🎯 **Ready to Use Today!**

The Jira integration is fully functional and ready for immediate use. No additional setup or HTTPS configuration required - just connect your API token and start managing issues directly from JunoKit! 

## Troubleshooting

### Infrastructure Issues
**Issue**: API Gateway authorizer limit reached during deployment  
**Solution**: ✅ **FIXED** - Implemented shared Cognito authorizer for all Jira endpoints instead of individual authorizers

**Issue**: Lambda deployment failures  
**Solution**: Check CloudWatch logs for specific error details

### Connection Issues  
**Issue**: "Unauthorized" errors when connecting  
**Solution**: Verify API token is valid and has sufficient permissions

**Issue**: "Domain not found" errors  
**Solution**: Ensure domain format is correct (without https:// prefix)

## Next Steps
1. ✅ Complete AWS infrastructure deployment
2. Test Jira integration functionality
3. Ready for production use!

## Security Notes
- API tokens are encrypted in AWS Secrets Manager
- JWT authentication required for all endpoints
- No OAuth/HTTPS requirements (unlike Slack integration)
- Per-user credential isolation

## Support
For issues or questions, check the CloudWatch logs for the `jira-integration` Lambda function. 