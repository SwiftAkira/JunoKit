import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

// Initialize clients
const dynamoClient = new DynamoDBClient({ region: process.env.REGION || process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Initialize Cognito JWT verifier
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID!,
  tokenUse: 'access',
  clientId: process.env.USER_POOL_CLIENT_ID!,
});

interface SlackMessageRequest {
  channel: string;
  text?: string;
  blocks?: any[];
  attachments?: any[];
  thread_ts?: string;
}

interface SlackChannel {
  id: string;
  name: string;
  is_channel: boolean;
  is_group: boolean;
  is_im: boolean;
  is_member: boolean;
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

    // Verify JWT token
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Missing or invalid authorization header' }),
      };
    }

    const token = authHeader.substring(7);
    let payload;
    
    try {
      payload = await verifier.verify(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid token' }),
      };
    }

    const userId = payload.sub;

    // Get user's Slack integration
    const slackAccessToken = await getSlackAccessToken(userId);
    if (!slackAccessToken) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Slack integration not found. Please connect your Slack workspace first.' }),
      };
    }

    const pathParts = event.path.split('/');
    const action = pathParts[pathParts.length - 1];

    switch (event.httpMethod) {
      case 'POST':
        if (action === 'send') {
          return await handleSendMessage(event, headers, slackAccessToken);
        }
        break;
      case 'GET':
        if (action === 'channels') {
          return await handleGetChannels(headers, slackAccessToken);
        }
        if (action === 'users') {
          return await handleGetUsers(headers, slackAccessToken);
        }
        break;
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Endpoint not found' }),
    };
  } catch (error) {
    console.error('Slack messaging handler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

async function getSlackAccessToken(userId: string): Promise<string | null> {
  try {
    // First check user profile for integration
    const getUserCommand = new GetCommand({
      TableName: process.env.USER_CONTEXT_TABLE,
      Key: { userId },
    });

    const userResult = await docClient.send(getUserCommand);
    const slackIntegration = userResult.Item?.integrations?.slack;

    if (!slackIntegration?.connected) {
      return null;
    }

    // Try to get detailed integration data
    const getIntegrationCommand = new GetCommand({
      TableName: process.env.INTEGRATIONS_TABLE || process.env.USER_CONTEXT_TABLE,
      Key: { 
        userId,
        integrationId: `slack:${slackIntegration.teamId}:${userId}`
      },
    });

    const integrationResult = await docClient.send(getIntegrationCommand);
    
    if (integrationResult.Item?.accessToken) {
      return integrationResult.Item.accessToken;
    }

    // Fallback: if no detailed integration found but basic integration exists
    // This shouldn't happen in normal flow but provides resilience
    return null;
  } catch (error) {
    console.error('Failed to get Slack access token:', error);
    return null;
  }
}

async function handleSendMessage(
  event: APIGatewayProxyEvent,
  headers: any,
  accessToken: string
): Promise<APIGatewayProxyResult> {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const messageRequest: SlackMessageRequest = JSON.parse(event.body);

    if (!messageRequest.channel) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Channel is required' }),
      };
    }

    if (!messageRequest.text && !messageRequest.blocks && !messageRequest.attachments) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message text, blocks, or attachments are required' }),
      };
    }

    // Prepare the Slack API request
    const slackPayload: any = {
      channel: messageRequest.channel,
    };

    if (messageRequest.text) {
      slackPayload.text = messageRequest.text;
    }

    if (messageRequest.blocks) {
      slackPayload.blocks = messageRequest.blocks;
    }

    if (messageRequest.attachments) {
      slackPayload.attachments = messageRequest.attachments;
    }

    if (messageRequest.thread_ts) {
      slackPayload.thread_ts = messageRequest.thread_ts;
    }

    // Send message to Slack
    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackPayload),
    });

    const result = await response.json();

    if (!result.ok) {
      console.error('Slack API error:', result);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: `Slack API error: ${result.error}`,
          details: result,
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: {
          ts: result.ts,
          channel: result.channel,
          text: result.message?.text,
        },
      }),
    };
  } catch (error) {
    console.error('Send message error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to send Slack message' }),
    };
  }
}

async function handleGetChannels(headers: any, accessToken: string): Promise<APIGatewayProxyResult> {
  try {
    const response = await fetch('https://slack.com/api/conversations.list?exclude_archived=true&types=public_channel,private_channel', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const result = await response.json();

    if (!result.ok) {
      console.error('Slack API error:', result);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: `Slack API error: ${result.error}`,
          details: result,
        }),
      };
    }

    const channels: SlackChannel[] = result.channels.map((channel: any) => ({
      id: channel.id,
      name: channel.name,
      is_channel: channel.is_channel,
      is_group: channel.is_group,
      is_im: channel.is_im,
      is_member: channel.is_member,
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        channels,
      }),
    };
  } catch (error) {
    console.error('Get channels error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to get Slack channels' }),
    };
  }
}

async function handleGetUsers(headers: any, accessToken: string): Promise<APIGatewayProxyResult> {
  try {
    const response = await fetch('https://slack.com/api/users.list', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const result = await response.json();

    if (!result.ok) {
      console.error('Slack API error:', result);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: `Slack API error: ${result.error}`,
          details: result,
        }),
      };
    }

    const users = result.members
      .filter((user: any) => !user.deleted && !user.is_bot)
      .map((user: any) => ({
        id: user.id,
        name: user.name,
        real_name: user.real_name,
        display_name: user.profile?.display_name,
        email: user.profile?.email,
      }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        users,
      }),
    };
  } catch (error) {
    console.error('Get users error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to get Slack users' }),
    };
  }
} 