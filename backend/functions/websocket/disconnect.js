const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.REGION }));

exports.handler = async (event) => {
  console.log('WebSocket Disconnect Event:', JSON.stringify(event, null, 2));
  
  const { connectionId } = event.requestContext;
  
  try {
    // Get connection info before deleting (for logging)
    let connectionInfo = null;
    try {
      const getResult = await dynamoDb.send(new GetCommand({
        TableName: process.env.CONNECTIONS_TABLE,
        Key: { connectionId },
      }));
      connectionInfo = getResult.Item;
    } catch (getError) {
      console.log('Could not retrieve connection info:', getError.message);
    }
    
    // Delete connection from DynamoDB
    await dynamoDb.send(new DeleteCommand({
      TableName: process.env.CONNECTIONS_TABLE,
      Key: { connectionId },
    }));
    
    console.log('Connection deleted successfully:', {
      connectionId,
      userId: connectionInfo?.userId,
      connectedAt: connectionInfo?.connectedAt,
      duration: connectionInfo?.connectedAt ? 
        Math.round((Date.now() - new Date(connectionInfo.connectedAt).getTime()) / 1000) : 
        null,
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Disconnected successfully',
        connectionId,
      }),
    };
    
  } catch (error) {
    console.error('Error in disconnect handler:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
        error: error.message,
      }),
    };
  }
}; 