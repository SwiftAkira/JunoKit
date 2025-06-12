const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand, QueryCommand, PutCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { ApiGatewayManagementApiClient, PostToConnectionCommand } = require('@aws-sdk/client-apigatewaymanagementapi');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.REGION }));
const secretsManager = new SecretsManagerClient({ region: process.env.REGION });

exports.handler = async (event) => {
  console.log('WebSocket Message Event:', JSON.stringify(event, null, 2));
  
  const { connectionId, domainName, stage } = event.requestContext;
  const apiGatewayManagementApi = new ApiGatewayManagementApiClient({
    region: process.env.REGION,
    endpoint: `https://${domainName}/${stage}`,
  });
  
  try {
    // Parse incoming message
    let messageData;
    try {
      messageData = JSON.parse(event.body);
    } catch (parseError) {
      throw new Error('Invalid JSON in message body');
    }
    
    const { action, data } = messageData;
    console.log('Processing action:', action);
    
    // Get connection info
    const connectionResult = await dynamoDb.send(new GetCommand({
      TableName: process.env.CONNECTIONS_TABLE,
      Key: { connectionId },
    }));
    
    if (!connectionResult.Item) {
      throw new Error('Connection not found');
    }
    
    const connection = connectionResult.Item;
    
    // Update last activity
    await dynamoDb.send(new UpdateCommand({
      TableName: process.env.CONNECTIONS_TABLE,
      Key: { connectionId },
      UpdateExpression: 'SET lastActivity = :now',
      ExpressionAttributeValues: {
        ':now': new Date().toISOString(),
      },
    }));
    
    // Handle different message actions
    let response;
    
    switch (action) {
      case 'ping':
        response = await handlePing(connection);
        break;
        
      case 'debug_status':
        response = await handleDebugStatus(connection);
        break;
        
      case 'chat_typing':
        response = await handleTypingIndicator(connection, data, apiGatewayManagementApi);
        break;
        
      case 'chat_message':
        response = await handleChatMessage(connection, data, apiGatewayManagementApi);
        break;
        
      case 'user_status':
        response = await handleUserStatus(connection, data, apiGatewayManagementApi);
        break;
        
      case 'subscribe_notifications':
        response = await handleSubscribeNotifications(connection, data);
        break;
        
      default:
        response = {
          type: 'error',
          message: `Unknown action: ${action}`,
        };
    }
    
    // Send response back to client
    await sendToConnection(apiGatewayManagementApi, connectionId, response);
    
    return { statusCode: 200 };
    
  } catch (error) {
    console.error('Error in message handler:', error);
    
    try {
      await sendToConnection(apiGatewayManagementApi, connectionId, {
        type: 'error',
        message: error.message,
      });
    } catch (sendError) {
      console.error('Error sending error response:', sendError);
    }
    
    return { statusCode: 500 };
  }
};

async function handlePing(connection) {
  return {
    type: 'pong',
    timestamp: new Date().toISOString(),
    connectionId: connection.connectionId,
    userId: connection.userId,
  };
}

async function handleDebugStatus(connection) {
  return {
    type: 'debug_status',
    timestamp: new Date().toISOString(),
    connectionInfo: {
      connectionId: connection.connectionId,
      userId: connection.userId,
      userEmail: connection.userEmail,
      isAuthenticated: connection.userId !== 'anonymous',
      connectedAt: connection.connectedAt,
      lastActivity: connection.lastActivity,
      status: connection.status,
    },
    environment: {
      hasApiSecretsArn: !!process.env.API_SECRETS_ARN,
      hasConnectionsTable: !!process.env.CONNECTIONS_TABLE,
      hasChatTable: !!process.env.CHAT_TABLE,
      region: process.env.REGION,
    }
  };
}

async function handleTypingIndicator(connection, data, apiGatewayManagementApi) {
  if (connection.userId === 'anonymous') {
    throw new Error('Authentication required for typing indicators');
  }
  
  const { conversationId, isTyping } = data;
  
  // Broadcast typing indicator to other users in the conversation
  // For now, we'll just acknowledge receipt
  return {
    type: 'typing_acknowledged',
    conversationId,
    isTyping,
    userId: connection.userId,
  };
}

async function handleChatMessage(connection, data, apiGatewayManagementApi) {
  if (connection.userId === 'anonymous') {
    // For debugging, provide more helpful error message
    return {
      type: 'error',
      message: 'Authentication required for chat messages. Please sign in to use real-time chat.',
      debugInfo: {
        connectionId: connection.connectionId,
        userId: connection.userId,
        requiresAuth: true,
        action: 'chat_message'
      }
    };
  }
  
  const { message, conversationId } = data;
  
  try {
    // Process the chat message through the existing AI chat system
    const chatResponse = await processChatWithAI(connection.userId, message, conversationId);
    
    // Send real-time AI response back to the user
    await sendToConnection(apiGatewayManagementApi, connection.connectionId, {
      type: 'ai_response',
      action: 'ai_response',
      conversationId: chatResponse.conversationId,
      messageId: chatResponse.aiMessage.messageId,
      content: chatResponse.aiMessage.content,
      timestamp: chatResponse.aiMessage.timestamp,
      userId: connection.userId,
    });
    
    return {
      type: 'message_received',
      conversationId: chatResponse.conversationId,
      messageId: chatResponse.userMessage.messageId,
      timestamp: new Date().toISOString(),
    };
    
  } catch (error) {
    console.error('Error processing chat message:', error);
    throw new Error('Failed to process chat message');
  }
}

async function processChatWithAI(userId, message, conversationId) {
  // This mirrors the logic from the ai-chat.ts function
  const finalConversationId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();

  // Store user message
  const userMessage = {
    messageId,
    userId,
    conversationId: finalConversationId,
    role: 'user',
    content: message,
    timestamp,
  };

  await storeChatMessage(userId, finalConversationId, userMessage);

  // Get AI response
  const aiResponse = await getAIResponse(userId, finalConversationId, message, 'openai/gpt-4o-mini');

  // Store AI message
  const aiMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const aiMessage = {
    messageId: aiMessageId,
    userId,
    conversationId: finalConversationId,
    role: 'assistant',
    content: aiResponse.content,
    timestamp: new Date().toISOString(),
    model: 'openai/gpt-4o-mini',
    tokens: aiResponse.tokens,
  };

  await storeChatMessage(userId, finalConversationId, aiMessage);

  // Update conversation metadata
  await updateConversation(userId, finalConversationId, message, 'openai/gpt-4o-mini');

  return {
    userMessage,
    aiMessage,
    conversationId: finalConversationId,
  };
}

async function handleUserStatus(connection, data, apiGatewayManagementApi) {
  if (connection.userId === 'anonymous') {
    throw new Error('Authentication required for status updates');
  }
  
  const { status } = data; // 'online', 'away', 'busy', 'offline'
  
  // Update user status in connection record
  await dynamoDb.send(new UpdateCommand({
    TableName: process.env.CONNECTIONS_TABLE,
    Key: { connectionId: connection.connectionId },
    UpdateExpression: 'SET userStatus = :status',
    ExpressionAttributeValues: {
      ':status': status,
    },
  }));
  
  return {
    type: 'status_updated',
    status,
    userId: connection.userId,
  };
}

async function handleSubscribeNotifications(connection, data) {
  const { notificationTypes } = data;
  
  // Update connection with notification preferences
  await dynamoDb.send(new UpdateCommand({
    TableName: process.env.CONNECTIONS_TABLE,
    Key: { connectionId: connection.connectionId },
    UpdateExpression: 'SET notificationSubscriptions = :subs',
    ExpressionAttributeValues: {
      ':subs': notificationTypes,
    },
  }));
  
  return {
    type: 'notifications_subscribed',
    subscriptions: notificationTypes,
  };
}

async function sendToConnection(apiGatewayManagementApi, connectionId, message) {
  try {
    await apiGatewayManagementApi.send(new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: JSON.stringify(message),
    }));
  } catch (error) {
    if (error.statusCode === 410) {
      console.log('Found stale connection, deleting:', connectionId);
      // Connection is stale, remove from database
      await dynamoDb.send(new DeleteCommand({
        TableName: process.env.CONNECTIONS_TABLE,
        Key: { connectionId },
      }));
    } else {
      throw error;
    }
  }
}

// Utility function to broadcast to multiple connections
async function broadcastToConnections(apiGatewayManagementApi, connectionIds, message) {
  const promises = connectionIds.map(async (connectionId) => {
    try {
      await sendToConnection(apiGatewayManagementApi, connectionId, message);
    } catch (error) {
      console.error(`Failed to send to connection ${connectionId}:`, error);
    }
  });
  
  await Promise.all(promises);
}

// AI Chat helper functions (from ai-chat.ts)
async function storeChatMessage(userId, conversationId, message) {
  await dynamoDb.send(new PutCommand({
    TableName: process.env.CHAT_TABLE || 'junokit-chat',
    Item: {
      PK: `USER#${userId}#CONV#${conversationId}`,
      SK: `MSG#${message.messageId}`,
      ...message,
    },
  }));
}

async function getAIResponse(userId, conversationId, message, model) {
  // Get OpenRouter API key from Secrets Manager
  let openRouterApiKey;
  try {
    const secretResult = await secretsManager.send(new GetSecretValueCommand({
      SecretId: process.env.API_SECRETS_ARN,
    }));
    const secrets = JSON.parse(secretResult.SecretString || '{}');
    openRouterApiKey = secrets.openRouterApiKey;

    if (!openRouterApiKey || openRouterApiKey === 'YOUR_OPENROUTER_API_KEY_HERE') {
      throw new Error('OpenRouter API key not configured in secrets');
    }
  } catch (error) {
    console.error('Error retrieving OpenRouter API key:', error);
    throw new Error('Failed to retrieve API key');
  }

  // Get conversation history
  const conversationHistory = await getConversationHistory(userId, conversationId);
  
  // Prepare messages for AI
  const messages = [
    {
      role: 'system',
      content: 'You are Junokit AI, an intelligent assistant helping developers with coding, project management, and technical questions. Be helpful, concise, and accurate.',
    },
    ...conversationHistory,
    {
      role: 'user',
      content: message,
    },
  ];

  // Call OpenRouter API
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openRouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://junokit.ai',
      'X-Title': 'Junokit AI Assistant',
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-r1-0528:free', // Using the same free model as regular chat
      messages,
      max_tokens: 1000,
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenRouter API error:', response.status, errorText);
    throw new Error(`AI API request failed: ${response.status}`);
  }

  const aiData = await response.json();
  
  return {
    content: aiData.choices[0].message.content,
    tokens: aiData.usage?.total_tokens || 0,
  };
}

async function getConversationHistory(userId, conversationId) {
  try {
    const result = await dynamoDb.send(new QueryCommand({
      TableName: process.env.CHAT_TABLE || 'junokit-chat',
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}#CONV#${conversationId}`,
        ':skPrefix': 'MSG#',
      },
      ScanIndexForward: true,
      Limit: 20,
    }));

    return (result.Items || []).map(item => ({
      role: item.role,
      content: item.content,
    }));
  } catch (error) {
    console.error('Error getting conversation history:', error);
    return [];
  }
}

async function updateConversation(userId, conversationId, lastMessage, model) {
  const title = lastMessage.length > 50 ? lastMessage.substring(0, 50) + '...' : lastMessage;
  const timestamp = new Date().toISOString();
  
  await dynamoDb.send(new PutCommand({
    TableName: process.env.CHAT_TABLE || 'junokit-chat',
    Item: {
      PK: `USER#${userId}`,
      SK: `CONV#${conversationId}`,
      conversationId,
      userId,
      title,
      createdAt: timestamp,
      updatedAt: timestamp,
      model,
      GSI1PK: `USER#${userId}`,
      GSI1SK: `CONV#${timestamp}`,
    },
  }));
} 