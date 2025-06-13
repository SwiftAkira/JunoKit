import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
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

interface JiraCredentials {
  domain: string;
  email: string;
  apiToken: string;
}

interface JiraIntegration {
  userId: string;
  integrationId: string;
  type: 'jira';
  domain: string;
  email: string;
  displayName?: string;
  accountId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  description?: string;
  status: {
    name: string;
    id: string;
  };
  issueType: {
    name: string;
    id: string;
    iconUrl?: string;
  };
  priority: {
    name: string;
    id: string;
    iconUrl?: string;
  };
  assignee?: {
    displayName: string;
    accountId: string;
    avatarUrls?: any;
  };
  reporter: {
    displayName: string;
    accountId: string;
    avatarUrls?: any;
  };
  project: {
    key: string;
    name: string;
    id: string;
  };
  created: string;
  updated: string;
  resolved?: string;
}

interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  simplified: boolean;
  style: string;
  isPrivate: boolean;
  description?: string;
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
      case 'connect':
        return await handleConnect(event, headers);
      case 'status':
        return await handleConnectionStatus(event, headers);
      case 'disconnect':
        return await handleDisconnect(event, headers);
      case 'projects':
        return await handleGetProjects(event, headers);
      case 'issues':
        return await handleGetIssues(event, headers);
      case 'issue':
        if (event.httpMethod === 'POST') {
          return await handleCreateIssue(event, headers);
        } else if (event.httpMethod === 'PUT') {
          return await handleUpdateIssue(event, headers);
        }
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
      case 'search':
        return await handleSearchIssues(event, headers);
      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Endpoint not found' }),
        };
    }
  } catch (error) {
    console.error('Jira integration handler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

async function verifyAuthToken(event: APIGatewayProxyEvent): Promise<any> {
  const authHeader = event.headers.Authorization || event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7);
  try {
    return await verifier.verify(token);
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid token');
  }
}

async function getJiraCredentials(userId: string): Promise<JiraCredentials | null> {
  try {
    const command = new GetCommand({
      TableName: process.env.USER_CONTEXT_TABLE!,
      Key: {
        userId,
        contextType: 'jira_integration',
      },
    });
    
    const result = await docClient.send(command);
    if (!result.Item) {
      return null;
    }
    
    const integration = result.Item as JiraIntegration;
    if (!integration.isActive) {
      return null;
    }

    // Get encrypted API token from secrets manager
    const secretCommand = new GetSecretValueCommand({
      SecretId: `junokit-jira-${userId}`,
    });
    
    const secretResult = await secretsClient.send(secretCommand);
    const secrets = JSON.parse(secretResult.SecretString || '{}');
    
    return {
      domain: integration.domain,
      email: integration.email,
      apiToken: secrets.apiToken,
    };
  } catch (error) {
    console.error('Failed to get Jira credentials:', error);
    return null;
  }
}

async function makeJiraRequest(credentials: JiraCredentials, endpoint: string, options: RequestInit = {}): Promise<any> {
  const baseUrl = `https://${credentials.domain}.atlassian.net/rest/api/3`;
  const url = `${baseUrl}${endpoint}`;
  
  const auth = Buffer.from(`${credentials.email}:${credentials.apiToken}`).toString('base64');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Jira API error (${response.status}):`, errorText);
    throw new Error(`Jira API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function handleConnect(event: APIGatewayProxyEvent, headers: any): Promise<APIGatewayProxyResult> {
  try {
    const payload = await verifyAuthToken(event);
    const body = JSON.parse(event.body || '{}');
    
    const { domain, email, apiToken } = body;
    
    if (!domain || !email || !apiToken) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: domain, email, apiToken' }),
      };
    }

    // Test the connection by making a test API call
    const testCredentials = { domain, email, apiToken };
    try {
      const userInfo = await makeJiraRequest(testCredentials, '/myself');
      
      // Store encrypted API token in secrets manager
      const secretCommand = new GetSecretValueCommand({
        SecretId: `junokit-jira-${payload.sub}`,
      });
      
      try {
        await secretsClient.send(secretCommand);
      } catch (error) {
        // Secret doesn't exist, create it
        const { CreateSecretCommand } = require('@aws-sdk/client-secrets-manager');
        const createCommand = new CreateSecretCommand({
          Name: `junokit-jira-${payload.sub}`,
          SecretString: JSON.stringify({ apiToken }),
          Description: `Jira API token for user ${payload.sub}`,
        });
        await secretsClient.send(createCommand);
      }

      // Store integration info in DynamoDB
      const integration: JiraIntegration = {
        userId: payload.sub,
        integrationId: `jira_${Date.now()}`,
        type: 'jira',
        domain,
        email,
        displayName: userInfo.displayName,
        accountId: userInfo.accountId,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const putCommand = new PutCommand({
        TableName: process.env.USER_CONTEXT_TABLE!,
        Item: {
          ...integration,
          contextType: 'jira_integration',
        },
      });

      await docClient.send(putCommand);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Jira integration connected successfully',
          integration: {
            connected: true,
            domain,
            email,
            displayName: userInfo.displayName,
            accountId: userInfo.accountId,
          },
        }),
      };
    } catch (apiError) {
      console.error('Jira connection test failed:', apiError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Failed to connect to Jira. Please check your credentials.' }),
      };
    }
  } catch (error) {
    console.error('Connect error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to connect Jira integration' }),
    };
  }
}

async function handleConnectionStatus(event: APIGatewayProxyEvent, headers: any): Promise<APIGatewayProxyResult> {
  try {
    const payload = await verifyAuthToken(event);
    
    const command = new GetCommand({
      TableName: process.env.USER_CONTEXT_TABLE!,
      Key: {
        userId: payload.sub,
        contextType: 'jira_integration',
      },
    });
    
    const result = await docClient.send(command);
    
    if (!result.Item || !result.Item.isActive) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ connected: false }),
      };
    }

    const integration = result.Item as JiraIntegration;
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        connected: true,
        domain: integration.domain,
        email: integration.email,
        displayName: integration.displayName,
        accountId: integration.accountId,
        connectedAt: integration.createdAt,
      }),
    };
  } catch (error) {
    console.error('Status check error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to check Jira connection status' }),
    };
  }
}

async function handleDisconnect(event: APIGatewayProxyEvent, headers: any): Promise<APIGatewayProxyResult> {
  try {
    const payload = await verifyAuthToken(event);
    
    // Mark integration as inactive
    const updateCommand = new UpdateCommand({
      TableName: process.env.USER_CONTEXT_TABLE!,
      Key: {
        userId: payload.sub,
        contextType: 'jira_integration',
      },
      UpdateExpression: 'SET isActive = :inactive, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':inactive': false,
        ':updatedAt': new Date().toISOString(),
      },
    });

    await docClient.send(updateCommand);

    // Optionally delete the secret
    try {
      const { DeleteSecretCommand } = require('@aws-sdk/client-secrets-manager');
      const deleteSecretCommand = new DeleteSecretCommand({
        SecretId: `junokit-jira-${payload.sub}`,
        ForceDeleteWithoutRecovery: true,
      });
      await secretsClient.send(deleteSecretCommand);
    } catch (secretError) {
      console.warn('Failed to delete Jira secret (may not exist):', secretError);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Jira integration disconnected successfully' }),
    };
  } catch (error) {
    console.error('Disconnect error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to disconnect Jira integration' }),
    };
  }
}

async function handleGetProjects(event: APIGatewayProxyEvent, headers: any): Promise<APIGatewayProxyResult> {
  try {
    const payload = await verifyAuthToken(event);
    const credentials = await getJiraCredentials(payload.sub);
    
    if (!credentials) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Jira integration not found or inactive' }),
      };
    }

    const projectsData = await makeJiraRequest(credentials, '/project/search?expand=description,lead,url');
    
    const projects: JiraProject[] = projectsData.values.map((project: any) => ({
      id: project.id,
      key: project.key,
      name: project.name,
      projectTypeKey: project.projectTypeKey,
      simplified: project.simplified,
      style: project.style,
      isPrivate: project.isPrivate,
      description: project.description,
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ projects }),
    };
  } catch (error) {
    console.error('Get projects error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch Jira projects' }),
    };
  }
}

async function handleGetIssues(event: APIGatewayProxyEvent, headers: any): Promise<APIGatewayProxyResult> {
  try {
    const payload = await verifyAuthToken(event);
    const credentials = await getJiraCredentials(payload.sub);
    
    if (!credentials) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Jira integration not found or inactive' }),
      };
    }

    const { projectKey, assignee, status, maxResults = '50' } = event.queryStringParameters || {};
    
    let jql = '';
    const conditions = [];
    
    if (projectKey) {
      conditions.push(`project = "${projectKey}"`);
    }
    if (assignee === 'me') {
      conditions.push('assignee = currentUser()');
    } else if (assignee) {
      conditions.push(`assignee = "${assignee}"`);
    }
    if (status) {
      conditions.push(`status = "${status}"`);
    }
    
    jql = conditions.join(' AND ');
    if (!jql) {
      jql = 'assignee = currentUser() OR reporter = currentUser()';
    }
    
    jql += ' ORDER BY updated DESC';
    
    const issuesData = await makeJiraRequest(
      credentials, 
      `/search?jql=${encodeURIComponent(jql)}&maxResults=${maxResults}&expand=names,schema,operations,editmeta,changelog,versionedRepresentations`
    );
    
    const issues: JiraIssue[] = issuesData.issues.map((issue: any) => ({
      id: issue.id,
      key: issue.key,
      summary: issue.fields.summary,
      description: issue.fields.description?.content ? 
        issue.fields.description.content.map((p: any) => 
          p.content?.map((c: any) => c.text).join('')
        ).join('\n') : undefined,
      status: {
        name: issue.fields.status.name,
        id: issue.fields.status.id,
      },
      issueType: {
        name: issue.fields.issuetype.name,
        id: issue.fields.issuetype.id,
        iconUrl: issue.fields.issuetype.iconUrl,
      },
      priority: {
        name: issue.fields.priority?.name || 'None',
        id: issue.fields.priority?.id || '',
        iconUrl: issue.fields.priority?.iconUrl,
      },
      assignee: issue.fields.assignee ? {
        displayName: issue.fields.assignee.displayName,
        accountId: issue.fields.assignee.accountId,
        avatarUrls: issue.fields.assignee.avatarUrls,
      } : undefined,
      reporter: {
        displayName: issue.fields.reporter.displayName,
        accountId: issue.fields.reporter.accountId,
        avatarUrls: issue.fields.reporter.avatarUrls,
      },
      project: {
        key: issue.fields.project.key,
        name: issue.fields.project.name,
        id: issue.fields.project.id,
      },
      created: issue.fields.created,
      updated: issue.fields.updated,
      resolved: issue.fields.resolutiondate,
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        issues,
        total: issuesData.total,
        maxResults: issuesData.maxResults,
        startAt: issuesData.startAt,
      }),
    };
  } catch (error) {
    console.error('Get issues error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch Jira issues' }),
    };
  }
}

async function handleCreateIssue(event: APIGatewayProxyEvent, headers: any): Promise<APIGatewayProxyResult> {
  try {
    const payload = await verifyAuthToken(event);
    const credentials = await getJiraCredentials(payload.sub);
    
    if (!credentials) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Jira integration not found or inactive' }),
      };
    }

    const body = JSON.parse(event.body || '{}');
    const { projectKey, summary, description, issueType = 'Task', priority = 'Medium' } = body;
    
    if (!projectKey || !summary) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: projectKey, summary' }),
      };
    }

    const issueData = {
      fields: {
        project: {
          key: projectKey,
        },
        summary,
        description: description ? {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: description,
                },
              ],
            },
          ],
        } : undefined,
        issuetype: {
          name: issueType,
        },
        priority: {
          name: priority,
        },
      },
    };

    const newIssue = await makeJiraRequest(credentials, '/issue', {
      method: 'POST',
      body: JSON.stringify(issueData),
    });

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        message: 'Issue created successfully',
        issue: {
          id: newIssue.id,
          key: newIssue.key,
          self: newIssue.self,
        },
      }),
    };
  } catch (error) {
    console.error('Create issue error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create Jira issue' }),
    };
  }
}

async function handleUpdateIssue(event: APIGatewayProxyEvent, headers: any): Promise<APIGatewayProxyResult> {
  try {
    const payload = await verifyAuthToken(event);
    const credentials = await getJiraCredentials(payload.sub);
    
    if (!credentials) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Jira integration not found or inactive' }),
      };
    }

    const body = JSON.parse(event.body || '{}');
    const { issueKey, fields } = body;
    
    if (!issueKey || !fields) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: issueKey, fields' }),
      };
    }

    await makeJiraRequest(credentials, `/issue/${issueKey}`, {
      method: 'PUT',
      body: JSON.stringify({ fields }),
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Issue updated successfully' }),
    };
  } catch (error) {
    console.error('Update issue error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to update Jira issue' }),
    };
  }
}

async function handleSearchIssues(event: APIGatewayProxyEvent, headers: any): Promise<APIGatewayProxyResult> {
  try {
    const payload = await verifyAuthToken(event);
    const credentials = await getJiraCredentials(payload.sub);
    
    if (!credentials) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Jira integration not found or inactive' }),
      };
    }

    const { q, maxResults = '20' } = event.queryStringParameters || {};
    
    if (!q) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing search query parameter: q' }),
      };
    }

    const jql = `text ~ "${q}" ORDER BY updated DESC`;
    
    const issuesData = await makeJiraRequest(
      credentials, 
      `/search?jql=${encodeURIComponent(jql)}&maxResults=${maxResults}`
    );
    
    const issues: JiraIssue[] = issuesData.issues.map((issue: any) => ({
      id: issue.id,
      key: issue.key,
      summary: issue.fields.summary,
      status: {
        name: issue.fields.status.name,
        id: issue.fields.status.id,
      },
      issueType: {
        name: issue.fields.issuetype.name,
        id: issue.fields.issuetype.id,
        iconUrl: issue.fields.issuetype.iconUrl,
      },
      project: {
        key: issue.fields.project.key,
        name: issue.fields.project.name,
        id: issue.fields.project.id,
      },
      updated: issue.fields.updated,
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        issues,
        total: issuesData.total,
        query: q,
      }),
    };
  } catch (error) {
    console.error('Search issues error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to search Jira issues' }),
    };
  }
}