/**
 * Junokit Shared Lambda Layer
 * Common utilities and AWS service clients for all Lambda functions
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { SecretsManagerClient } = require('@aws-sdk/client-secrets-manager');
const { SESClient } = require('@aws-sdk/client-ses');
const { CognitoIdentityProviderClient } = require('@aws-sdk/client-cognito-identity-provider');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const _ = require('lodash');

// AWS Region Configuration
const AWS_REGION = process.env.AWS_REGION || 'eu-north-1';

// AWS Service Clients (initialized once, reused across invocations)
const dynamoClient = new DynamoDBClient({ region: AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const secretsClient = new SecretsManagerClient({ region: AWS_REGION });
const sesClient = new SESClient({ region: AWS_REGION });
const cognitoClient = new CognitoIdentityProviderClient({ region: AWS_REGION });

/**
 * Common response headers for API Gateway
 */
const commonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

/**
 * Standard API response formatter
 */
function createResponse(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: { ...commonHeaders, ...headers },
    body: JSON.stringify(body),
  };
}

/**
 * Success response
 */
function successResponse(data, statusCode = 200) {
  return createResponse(statusCode, {
    success: true,
    data,
    timestamp: moment().toISOString(),
  });
}

/**
 * Error response
 */
function errorResponse(message, statusCode = 400, errorCode = null) {
  return createResponse(statusCode, {
    success: false,
    error: {
      message,
      code: errorCode,
      timestamp: moment().toISOString(),
    },
  });
}

/**
 * Generate TTL timestamp (for DynamoDB)
 */
function generateTTL(hours = 24) {
  return Math.floor(Date.now() / 1000) + (hours * 3600);
}

/**
 * Validate required environment variables
 */
function validateEnvironment(requiredVars) {
  const missing = requiredVars.filter(varName => !process.env[varName]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Parse JWT token (basic parsing, not verification)
 */
function parseJwtToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload;
  } catch (error) {
    throw new Error('Failed to parse JWT token');
  }
}

/**
 * Log structured message (CloudWatch compatible)
 */
function logMessage(level, message, meta = {}) {
  const logEntry = {
    timestamp: moment().toISOString(),
    level: level.toUpperCase(),
    message,
    ...meta,
  };
  console.log(JSON.stringify(logEntry));
}

// Convenience logging methods
const logger = {
  info: (message, meta) => logMessage('info', message, meta),
  error: (message, meta) => logMessage('error', message, meta),
  warn: (message, meta) => logMessage('warn', message, meta),
  debug: (message, meta) => logMessage('debug', message, meta),
};

module.exports = {
  // AWS Clients
  docClient,
  secretsClient,
  sesClient,
  cognitoClient,
  
  // Response helpers
  successResponse,
  errorResponse,
  createResponse,
  
  // Utilities
  generateTTL,
  validateEnvironment,
  parseJwtToken,
  logger,
  
  // External libraries
  uuid: uuidv4,
  moment,
  _,
  
  // Constants
  AWS_REGION,
}; 