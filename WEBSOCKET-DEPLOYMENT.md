# 🔄 WebSocket Integration Deployment Guide

## Overview

This guide covers the deployment of **Phase 5: WebSocket Integration** for real-time features in Junokit. The implementation includes AWS API Gateway WebSocket API, Lambda functions for connection management, and frontend WebSocket client.

## 🏗️ Infrastructure Components

### Backend Components
- **WebSocket API Gateway**: Handles WebSocket connections and routing
- **DynamoDB Connections Table**: Stores active WebSocket connections
- **Lambda Functions**:
  - `connect.js`: Manages new WebSocket connections
  - `disconnect.js`: Cleans up closed connections  
  - `message.js`: Processes real-time messages and actions

### Frontend Components
- **WebSocket Client**: `src/lib/websocket.ts` - Handles connection management
- **Demo Component**: `src/components/WebSocketDemo.tsx` - Interactive testing interface
- **Demo Page**: `/websocket-demo` - Full-featured test environment

## 🚀 Deployment Steps

### 1. Install CDK Dependencies

```bash
cd infrastructure/aws-cdk
npm install @aws-cdk/aws-apigatewayv2-integrations
```

### 2. Deploy Infrastructure

```bash
# Deploy the updated infrastructure
npm run deploy

# Or if you need to force update
npm run deploy -- --force
```

### 3. Note Deployment Outputs

After deployment, save these outputs:

```bash
# Example outputs (replace with your actual values)
WebSocketApiUrl = wss://abc123.execute-api.eu-north-1.amazonaws.com/v1
WebSocketApiId = abc123
ConnectionsTableName = junokit-websocket-connections
```

### 4. Update Frontend Environment Variables

Create `.env.local` in the frontend directory:

```bash
cd frontend
cp .env.example .env.local  # If available, or create manually
```

Add the following configuration:

```env
# WebSocket Configuration
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-websocket-api-id.execute-api.eu-north-1.amazonaws.com/v1

# API Configuration  
NEXT_PUBLIC_API_BASE_URL=https://your-api-gateway-id.execute-api.eu-north-1.amazonaws.com/v1

# AWS Cognito Configuration
NEXT_PUBLIC_USER_POOL_ID=your-user-pool-id
NEXT_PUBLIC_USER_POOL_CLIENT_ID=your-user-pool-client-id

# Environment
NEXT_PUBLIC_ENVIRONMENT=development
```

### 5. Restart Development Server

```bash
# Kill existing server and restart
npm run dev
```

## 🧪 Testing the Implementation

### 1. Access the Demo Page

Navigate to: `http://localhost:3001/websocket-demo`

### 2. Test Connection Flow

1. **Connect**: Click "Connect" button to establish WebSocket connection
2. **Authentication**: Connection works with or without auth token
3. **Ping/Pong**: Test basic connectivity with ping button
4. **Message Sending**: Send custom messages and see responses
5. **Status Updates**: Change user status (online/away/busy)
6. **Notifications**: Subscribe to notification types

### 3. Monitor Logs

- **Frontend Logs**: Browser console and demo interface logs
- **Backend Logs**: AWS CloudWatch logs for Lambda functions
- **Connection Tracking**: DynamoDB connections table

## 📊 WebSocket API Endpoints

### Connection Routes

- **$connect**: Triggered when client connects
  - Validates auth token (optional)
  - Stores connection in DynamoDB
  - Returns connection info

- **$disconnect**: Triggered when client disconnects
  - Removes connection from DynamoDB
  - Logs connection duration

- **$default**: Handles all message routing
  - Processes action-based messages
  - Updates connection activity
  - Returns appropriate responses

### Message Actions

The WebSocket API supports these message actions:

```typescript
// Ping/Pong for keepalive
{ action: 'ping' }

// User status updates
{ action: 'user_status', data: { status: 'online' | 'away' | 'busy' | 'offline' } }

// Chat typing indicators
{ action: 'chat_typing', data: { conversationId: string, isTyping: boolean } }

// Chat messages
{ action: 'chat_message', data: { conversationId: string, message: string } }

// Notification subscriptions
{ action: 'subscribe_notifications', data: { notificationTypes: string[] } }
```

## 🔧 Configuration Details

### DynamoDB Connections Table Schema

```typescript
{
  connectionId: string,        // Partition key
  userId: string,             // User ID or 'anonymous'
  userEmail?: string,         // User email if authenticated
  domainName: string,         // API Gateway domain
  stage: string,              // API stage (v1)
  connectedAt: string,        // ISO timestamp
  lastActivity: string,       // ISO timestamp
  ttl: number,               // Auto-cleanup after 24 hours
  status: string,            // 'connected'
  userStatus?: string,       // 'online', 'away', 'busy', 'offline'
  notificationSubscriptions?: string[]
}
```

### Lambda Environment Variables

Each Lambda function has access to:

```bash
CONNECTIONS_TABLE=junokit-websocket-connections
USER_POOL_ID=your-cognito-user-pool-id
REGION=eu-north-1
CHAT_TABLE=junokit-chat-messages  # For message handler
API_SECRETS_ARN=arn:aws:secretsmanager:...  # For API keys
```

## 🛠️ Troubleshooting

### Common Issues

1. **Connection Fails**
   - Check WebSocket URL in environment variables
   - Verify API Gateway deployment
   - Check browser network tab for errors

2. **Lambda Errors**
   - Check CloudWatch logs: `/aws/lambda/junokit`
   - Verify DynamoDB table permissions
   - Check Lambda function environment variables

3. **CORS Issues**
   - WebSocket doesn't use CORS, but initial HTTP upgrade might
   - Check API Gateway settings

4. **Stale Connections**
   - Connections automatically cleanup after 24 hours (TTL)
   - Manual cleanup on connection errors (410 status)

### Debugging Commands

```bash
# Check CDK deployment status
cd infrastructure/aws-cdk
npx cdk ls
npx cdk diff

# View CloudWatch logs
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/junokit"

# Query connections table
aws dynamodb scan --table-name junokit-websocket-connections --region eu-north-1

# Test WebSocket connection
wscat -c "wss://your-api-id.execute-api.eu-north-1.amazonaws.com/v1"
```

## 🔄 Next Steps

Once WebSocket infrastructure is deployed and tested:

1. **Integrate with Chat System**: Add real-time message delivery
2. **User Presence**: Show online/offline status
3. **Typing Indicators**: Real-time typing notifications
4. **AI Response Streaming**: Stream AI responses in real-time
5. **System Notifications**: Push important updates to users

## 📝 Code Structure

```
backend/functions/websocket/
├── connect.js          # Connection handler
├── disconnect.js       # Disconnection handler
└── message.js          # Message router

frontend/src/
├── lib/websocket.ts           # WebSocket client
├── components/WebSocketDemo.tsx   # Demo interface
└── app/websocket-demo/page.tsx    # Demo page

infrastructure/aws-cdk/lib/
└── junokit-infra-stack.ts     # Updated with WebSocket resources
```

## 🎯 Success Criteria

- [ ] WebSocket API Gateway deployed successfully
- [ ] Lambda functions operational
- [ ] Frontend can connect to WebSocket
- [ ] Real-time message exchange working
- [ ] Connection state management functional
- [ ] Authentication integration working
- [ ] Demo page fully functional

---

**🔥 This implementation provides the foundation for all real-time features in Junokit!** 