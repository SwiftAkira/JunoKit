const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { CognitoJwtVerifier } = require('aws-jwt-verify');

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.REGION }));

// Create verifier for Cognito JWT tokens
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID,
  tokenUse: 'access',
  clientId: null, // Will accept tokens from any client
});

exports.handler = async (event) => {
  console.log('WebSocket Connect Event:', JSON.stringify(event, null, 2));
  
  const { connectionId } = event.requestContext;
  const { domainName, stage } = event.requestContext;
  
  try {
    // Extract auth token from query parameters or headers
    const token = event.queryStringParameters?.token || 
                  event.headers?.Authorization?.replace('Bearer ', '') ||
                  event.headers?.authorization?.replace('Bearer ', '');
    
    let userId = null;
    let userEmail = null;
    
    if (token) {
      try {
        // Verify JWT token
        const payload = await verifier.verify(token);
        userId = payload.sub;
        userEmail = payload.email;
        console.log('Authenticated user:', { userId, userEmail });
      } catch (tokenError) {
        console.log('Token verification failed:', tokenError.message);
        // Allow connection but mark as unauthenticated
      }
    }
    
    // Store connection in DynamoDB
    const connectionData = {
      connectionId,
      userId: userId || 'anonymous',
      userEmail: userEmail || null,
      domainName,
      stage,
      connectedAt: new Date().toISOString(),
      ttl: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours TTL
      status: 'connected',
      lastActivity: new Date().toISOString(),
    };
    
    await dynamoDb.send(new PutCommand({
      TableName: process.env.CONNECTIONS_TABLE,
      Item: connectionData,
    }));
    
    console.log('Connection stored successfully:', connectionId);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Connected successfully',
        connectionId,
        authenticated: !!userId,
      }),
    };
    
  } catch (error) {
    console.error('Error in connect handler:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
        error: error.message,
      }),
    };
  }
}; 