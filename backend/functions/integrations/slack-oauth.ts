import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

// Initialize clients
const dynamoClient = new DynamoDBClient({ region: process.env.REGION || process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const secretsClient = new SecretsManagerClient({ region: process.env.REGION || process.env.AWS_REGION });

// Initialize Cognito JWT verifier
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID!,
  tokenUse: 'access',
  clientId: process.env.USER_POOL_CLIENT_ID!,
});

interface SlackCredentials {
  clientId: string;
  clientSecret: string;
}

interface SlackIntegration {
  userId: string;
  integrationId: string;
  type: 'slack';
  accessToken: string;
  teamId: string;
  teamName: string;
  userId_slack: string;
  userName: string;
  scope: string;
  tokenType: string;
  enterpriseId?: string;
  enterpriseName?: string;
  isEnterprise: boolean;
  appId: string;
  authTestResponse?: any;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
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

    const pathParts = event.path.split('/');
    const action = pathParts[pathParts.length - 1]; // Last part of the path

    switch (action) {
      case 'auth':
        return await handleAuthInitiation(event, headers);
      case 'callback':
        return await handleOAuthCallback(event, headers);
      case 'status':
        return await handleConnectionStatus(event, headers);
      case 'disconnect':
        return await handleDisconnect(event, headers);
      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Endpoint not found' }),
        };
    }
  } catch (error) {
    console.error('Slack OAuth handler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

async function getSlackCredentials(): Promise<SlackCredentials> {
  try {
    const command = new GetSecretValueCommand({
      SecretId: 'junokit-api-secrets',
    });
    
    const result = await secretsClient.send(command);
    const secrets = JSON.parse(result.SecretString || '{}');
    
    if (!secrets.slackClientId || !secrets.slackClientSecret) {
      throw new Error('Slack credentials not configured in secrets manager');
    }
    
    return {
      clientId: secrets.slackClientId,
      clientSecret: secrets.slackClientSecret,
    };
  } catch (error) {
    console.error('Failed to get Slack credentials:', error);
    throw new Error('Slack integration not properly configured');
  }
}

async function handleAuthInitiation(event: APIGatewayProxyEvent, headers: any): Promise<APIGatewayProxyResult> {
  try {
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

    const credentials = await getSlackCredentials();
    
    // Generate OAuth URL
    const state = `${payload.sub}:${Date.now()}:${Math.random().toString(36).substring(7)}`;
    const scope = 'channels:read,channels:write,chat:write,users:read,teams:read,im:write,groups:write';
    
    const redirectUri = `${process.env.FRONTEND_URL || 'https://app.junokit.com'}/integrations/slack/callback`;
    
    const oauthUrl = new URL('https://slack.com/oauth/v2/authorize');
    oauthUrl.searchParams.set('client_id', credentials.clientId);
    oauthUrl.searchParams.set('scope', scope);
    oauthUrl.searchParams.set('redirect_uri', redirectUri);
    oauthUrl.searchParams.set('state', state);
    oauthUrl.searchParams.set('user_scope', 'identity.basic,identity.email');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        authUrl: oauthUrl.toString(),
        state,
      }),
    };
  } catch (error) {
    console.error('Auth initiation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to initiate Slack OAuth' }),
    };
  }
}

async function handleOAuthCallback(event: APIGatewayProxyEvent, headers: any): Promise<APIGatewayProxyResult> {
  try {
    const { code, state, error: oauthError } = event.queryStringParameters || {};
    
    if (oauthError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `OAuth error: ${oauthError}` }),
      };
    }
    
    if (!code || !state) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing authorization code or state' }),
      };
    }

    // Parse and validate state
    const [userId, timestamp] = state.split(':');
    if (!userId || !timestamp) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid state parameter' }),
      };
    }

    // Check if state is not too old (5 minutes)
    const stateAge = Date.now() - parseInt(timestamp);
    if (stateAge > 5 * 60 * 1000) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'OAuth state expired' }),
      };
    }

    const credentials = await getSlackCredentials();
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        code,
        redirect_uri: `${process.env.FRONTEND_URL || 'https://app.junokit.com'}/integrations/slack/callback`,
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.ok) {
      console.error('Slack OAuth token exchange failed:', tokenData);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `Slack OAuth failed: ${tokenData.error}` }),
      };
    }

    // Test the token to get user info
    const authTestResponse = await fetch('https://slack.com/api/auth.test', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });
    
    const authTest = await authTestResponse.json();
    
    if (!authTest.ok) {
      console.error('Slack auth test failed:', authTest);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Failed to verify Slack token' }),
      };
    }

    // Store integration in DynamoDB
    const integration: SlackIntegration = {
      userId,
      integrationId: `slack:${authTest.team_id}:${userId}`,
      type: 'slack',
      accessToken: tokenData.access_token,
      teamId: authTest.team_id,
      teamName: authTest.team || 'Unknown Team',
      userId_slack: authTest.user_id,
      userName: authTest.user || 'Unknown User',
      scope: tokenData.scope,
      tokenType: tokenData.token_type,
      enterpriseId: authTest.enterprise_id,
      enterpriseName: authTest.enterprise_name,
      isEnterprise: !!authTest.enterprise_id,
      appId: tokenData.app_id,
      authTestResponse: authTest,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    };

    const putCommand = new PutCommand({
      TableName: process.env.INTEGRATIONS_TABLE || process.env.USER_CONTEXT_TABLE,
      Item: integration,
    });

    await docClient.send(putCommand);

    // Update user profile to include Slack integration
    const updateUserCommand = new UpdateCommand({
      TableName: process.env.USER_CONTEXT_TABLE,
      Key: { userId },
      UpdateExpression: 'SET integrations.slack = :integration, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':integration': {
          connected: true,
          teamId: authTest.team_id,
          teamName: authTest.team || 'Unknown Team',
          userName: authTest.user || 'Unknown User',
          connectedAt: new Date().toISOString(),
        },
        ':updatedAt': new Date().toISOString(),
      },
    });

    try {
      await docClient.send(updateUserCommand);
    } catch (error) {
      // If the integrations attribute doesn't exist, create it
      const updateUserCommandCreate = new UpdateCommand({
        TableName: process.env.USER_CONTEXT_TABLE,
        Key: { userId },
        UpdateExpression: 'SET integrations = :integrations, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':integrations': {
            slack: {
              connected: true,
              teamId: authTest.team_id,
              teamName: authTest.team || 'Unknown Team',
              userName: authTest.user || 'Unknown User',
              connectedAt: new Date().toISOString(),
            },
          },
          ':updatedAt': new Date().toISOString(),
        },
      });
      await docClient.send(updateUserCommandCreate);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        integration: {
          teamId: authTest.team_id,
          teamName: authTest.team || 'Unknown Team',
          userName: authTest.user || 'Unknown User',
          connectedAt: new Date().toISOString(),
        },
      }),
    };
  } catch (error) {
    console.error('OAuth callback error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to complete Slack OAuth' }),
    };
  }
}

async function handleConnectionStatus(event: APIGatewayProxyEvent, headers: any): Promise<APIGatewayProxyResult> {
  try {
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

    // Get user profile to check integration status
    const getUserCommand = new GetCommand({
      TableName: process.env.USER_CONTEXT_TABLE,
      Key: { userId },
    });

    const userResult = await docClient.send(getUserCommand);
    const slackIntegration = userResult.Item?.integrations?.slack;

    if (!slackIntegration?.connected) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          connected: false,
          integration: null,
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        connected: true,
        integration: slackIntegration,
      }),
    };
  } catch (error) {
    console.error('Connection status error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to get connection status' }),
    };
  }
}

async function handleDisconnect(event: APIGatewayProxyEvent, headers: any): Promise<APIGatewayProxyResult> {
  try {
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

    // Update user profile to remove Slack integration
    const updateUserCommand = new UpdateCommand({
      TableName: process.env.USER_CONTEXT_TABLE,
      Key: { userId },
      UpdateExpression: 'REMOVE integrations.slack SET updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':updatedAt': new Date().toISOString(),
      },
    });

    await docClient.send(updateUserCommand);

    // TODO: Also remove from dedicated integrations table if it exists
    // and revoke the Slack token if possible

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Slack integration disconnected',
      }),
    };
  } catch (error) {
    console.error('Disconnect error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to disconnect Slack integration' }),
    };
  }
} 