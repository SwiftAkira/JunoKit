import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

// Initialize clients
const dynamoClient = new DynamoDBClient({ region: process.env.REGION || process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const secretsClient = new SecretsManagerClient({ region: process.env.REGION || process.env.AWS_REGION });

interface ChatMessage {
  messageId: string;
  userId: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model?: string;
  tokens?: number;
}

interface Conversation {
  conversationId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  model: string;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  };

  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: '',
      };
    }

    // Temporarily skip JWT verification for testing
    console.log('Request received:', JSON.stringify(event, null, 2));
    
    // Use a test user ID for now
    const userId = 'test-user-123';
    const pathParameters = event.pathParameters || {};

    switch (event.httpMethod) {
      case 'GET':
        if (pathParameters.conversationId) {
          return await getConversationMessages(userId, pathParameters.conversationId, headers);
        } else {
          return await getUserConversations(userId, headers);
        }
      case 'POST':
        return await createChatMessage(userId, event.body, headers);
      case 'DELETE':
        if (pathParameters.conversationId) {
          return await deleteConversation(userId, pathParameters.conversationId, headers);
        } else {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Conversation ID is required for deletion' }),
          };
        }
      case 'PUT':
        if (pathParameters.conversationId) {
          return await updateConversationTitle(userId, pathParameters.conversationId, event.body, headers);
        } else {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Conversation ID is required for update' }),
          };
        }
      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
  } catch (error) {
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message }),
    };
  }
};

async function getUserConversations(userId: string, headers: any): Promise<APIGatewayProxyResult> {
  try {
    const command = new QueryCommand({
      TableName: process.env.CHAT_TABLE,
      IndexName: 'UserConversationsIndex',
      KeyConditionExpression: 'GSI1PK = :gsi1pk AND begins_with(GSI1SK, :convPrefix)',
      ExpressionAttributeValues: {
        ':gsi1pk': `USER#${userId}`,
        ':convPrefix': 'CONV#',
      },
      ScanIndexForward: false, // Most recent first
      Limit: 50,
    });

    const result = await docClient.send(command);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        conversations: result.Items || [],
      }),
    };
  } catch (error) {
    console.error('Get conversations error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to get conversations' }),
    };
  }
}

async function getConversationMessages(userId: string, conversationId: string, headers: any): Promise<APIGatewayProxyResult> {
  try {
    const command = new QueryCommand({
      TableName: process.env.CHAT_TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :msgPrefix)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}#CONV#${conversationId}`,
        ':msgPrefix': 'MSG#',
      },
      ScanIndexForward: true, // Chronological order
    });

    const result = await docClient.send(command);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        messages: result.Items || [],
        conversationId,
      }),
    };
  } catch (error) {
    console.error('Get messages error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to get messages' }),
    };
  }
}

async function createChatMessage(userId: string, body: string | null, headers: any): Promise<APIGatewayProxyResult> {
  try {
    if (!body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const { message, conversationId, model = 'openai/gpt-4o-mini' } = JSON.parse(body);

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' }),
      };
    }

    const finalConversationId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    // Store user message
    const userMessage: ChatMessage = {
      messageId,
      userId,
      conversationId: finalConversationId,
      role: 'user',
      content: message,
      timestamp,
    };

    await storeChatMessage(userId, finalConversationId, userMessage);

    // Get AI response
    const aiResponse = await getAIResponse(userId, finalConversationId, message, model);

    // Store AI message
    const aiMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const aiMessage: ChatMessage = {
      messageId: aiMessageId,
      userId,
      conversationId: finalConversationId,
      role: 'assistant',
      content: aiResponse.content,
      timestamp: new Date().toISOString(),
      model,
      tokens: aiResponse.tokens,
    };

    await storeChatMessage(userId, finalConversationId, aiMessage);

    // Update conversation metadata
    await updateConversation(userId, finalConversationId, message, model);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        userMessage,
        aiMessage,
        conversationId: finalConversationId,
      }),
    };
  } catch (error) {
    console.error('Create chat message error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create chat message' }),
    };
  }
}

async function storeChatMessage(userId: string, conversationId: string, message: ChatMessage): Promise<void> {
  const command = new PutCommand({
    TableName: process.env.CHAT_TABLE,
    Item: {
      PK: `USER#${userId}#CONV#${conversationId}`,
      SK: `MSG#${message.timestamp}#${message.messageId}`,
      ...message,
      GSI1PK: `USER#${userId}`,
      GSI1SK: `CONV#${conversationId}#${message.timestamp}`,
    },
  });

  await docClient.send(command);
}

async function updateConversation(userId: string, conversationId: string, lastMessage: string, model: string): Promise<void> {
  const title = lastMessage.length > 50 ? lastMessage.substring(0, 50) + '...' : lastMessage;
  const timestamp = new Date().toISOString();

  const command = new PutCommand({
    TableName: process.env.CHAT_TABLE,
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
  });

  await docClient.send(command);
}

async function getAIResponse(userId: string, conversationId: string, message: string, model: string): Promise<{ content: string; tokens: number }> {
  try {
    // Get OpenRouter API key from Secrets Manager
    const secretCommand = new GetSecretValueCommand({
      SecretId: process.env.API_SECRETS_ARN,
    });
    
    const secretResult = await secretsClient.send(secretCommand);
    const secrets = JSON.parse(secretResult.SecretString || '{}');
    const openRouterApiKey = secrets.openRouterApiKey;

    if (!openRouterApiKey || openRouterApiKey === 'YOUR_OPENROUTER_API_KEY_HERE') {
      throw new Error('OpenRouter API key not configured in secrets');
    }

    // Get conversation history for context
    const historyCommand = new QueryCommand({
      TableName: process.env.CHAT_TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :msgPrefix)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}#CONV#${conversationId}`,
        ':msgPrefix': 'MSG#',
      },
      ScanIndexForward: true,
      Limit: 20, // Last 20 messages for context
    });

    const historyResult = await docClient.send(historyCommand);
    const history = historyResult.Items || [];

    // Build messages array for OpenRouter
    const messages = [
      {
        role: 'system',
        content: 'You are Junokit AI, a helpful work assistant. You help users with coding, project management, and general work tasks. Be concise but thorough in your responses.',
      },
      ...history.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user',
        content: message,
      },
    ];

    // Use OpenAI client pattern for OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://junokit.com',
        'X-Title': 'Junokit AI Assistant',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-0528:free', // Using the free model you specified
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
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices[0]?.message?.content || 'Sorry, I could not generate a response.',
      tokens: data.usage?.total_tokens || 0,
    };
  } catch (error) {
    console.error('AI response error:', error);
    return {
      content: 'Sorry, I encountered an error while processing your request. Please try again. (Error: OpenRouter API key may not be configured)',
      tokens: 0,
    };
  }
}

async function deleteConversation(userId: string, conversationId: string, headers: any): Promise<APIGatewayProxyResult> {
  try {
    // First, delete all messages in the conversation
    const messagesCommand = new QueryCommand({
      TableName: process.env.CHAT_TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :msgPrefix)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}#CONV#${conversationId}`,
        ':msgPrefix': 'MSG#',
      },
    });

    const messagesResult = await docClient.send(messagesCommand);

    // Delete all message records
    if (messagesResult.Items && messagesResult.Items.length > 0) {
      for (const item of messagesResult.Items) {
        const deleteCommand = new DeleteCommand({
          TableName: process.env.CHAT_TABLE,
          Key: {
            PK: item.PK,
            SK: item.SK,
          },
        });
        await docClient.send(deleteCommand);
      }
    }

    // Delete the conversation metadata record
    const conversationDeleteCommand = new DeleteCommand({
      TableName: process.env.CHAT_TABLE,
      Key: {
        PK: `USER#${userId}`,
        SK: `CONV#${conversationId}`,
      },
    });
    await docClient.send(conversationDeleteCommand);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Conversation deleted successfully' }),
    };
  } catch (error) {
    console.error('Delete conversation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to delete conversation' }),
    };
  }
}

async function updateConversationTitle(userId: string, conversationId: string, body: string | null, headers: any): Promise<APIGatewayProxyResult> {
  try {
    if (!body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const { title } = JSON.parse(body);

    if (!title) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Title is required' }),
      };
    }

    await updateConversation(userId, conversationId, title, 'openai/gpt-4o-mini');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Conversation title updated successfully' }),
    };
  } catch (error) {
    console.error('Update conversation title error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to update conversation title' }),
    };
  }
} 