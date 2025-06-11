import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({ region: process.env.REGION || process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Initialize Cognito JWT verifier
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID!,
  tokenUse: 'access',
  clientId: process.env.USER_POOL_CLIENT_ID!,
});

interface UserProfile {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  theme: string;
  inviteCode?: string;
  createdAt: string;
  lastLoginAt: string;
  updatedAt: string;
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
    const email = payload.email || payload.username;

    switch (event.httpMethod) {
      case 'GET':
        return await getUserProfile(userId, email, headers);
      case 'PUT':
        return await updateUserProfile(userId, event.body, headers);
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
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

async function getUserProfile(userId: string, email: string, headers: any): Promise<APIGatewayProxyResult> {
  try {
    const command = new GetCommand({
      TableName: process.env.USER_CONTEXT_TABLE,
      Key: { userId },
    });

    const result = await docClient.send(command);

    if (result.Item) {
      // Update last login time
      const updateCommand = new PutCommand({
        TableName: process.env.USER_CONTEXT_TABLE,
        Item: {
          ...result.Item,
          lastLoginAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
      await docClient.send(updateCommand);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.Item),
      };
    } else {
      // Create default profile for new user
      const defaultProfile: UserProfile = {
        userId,
        email,
        firstName: email.split('@')[0], // Default to email prefix
        lastName: '',
        role: 'dev', // Default role
        theme: 'dev', // Default theme
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const createCommand = new PutCommand({
        TableName: process.env.USER_CONTEXT_TABLE,
        Item: defaultProfile,
      });

      await docClient.send(createCommand);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(defaultProfile),
      };
    }
  } catch (error) {
    console.error('Get user profile error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to get user profile' }),
    };
  }
}

async function updateUserProfile(userId: string, body: string | null, headers: any): Promise<APIGatewayProxyResult> {
  try {
    if (!body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const updates = JSON.parse(body);
    
    // Get current profile
    const getCommand = new GetCommand({
      TableName: process.env.USER_CONTEXT_TABLE,
      Key: { userId },
    });

    const currentResult = await docClient.send(getCommand);
    
    if (!currentResult.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User profile not found' }),
      };
    }

    // Merge updates with current profile
    const updatedProfile = {
      ...currentResult.Item,
      ...updates,
      userId, // Ensure userId cannot be changed
      updatedAt: new Date().toISOString(),
    };

    const updateCommand = new PutCommand({
      TableName: process.env.USER_CONTEXT_TABLE,
      Item: updatedProfile,
    });

    await docClient.send(updateCommand);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(updatedProfile),
    };
  } catch (error) {
    console.error('Update user profile error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to update user profile' }),
    };
  }
} 