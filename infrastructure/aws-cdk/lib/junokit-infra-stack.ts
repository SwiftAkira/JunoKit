import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ses from 'aws-cdk-lib/aws-ses';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export class JunokitInfraStack extends cdk.Stack {
  public readonly userContextTable: dynamodb.Table;
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly api: apigateway.RestApi;
  public readonly webSocketApi: apigatewayv2.WebSocketApi;
  public readonly webSocketStage: apigatewayv2.WebSocketStage;
  public readonly connectionsTable: dynamodb.Table;
  public readonly lambdaExecutionRole: iam.Role;
  // public readonly sharedLambdaLayer: lambda.LayerVersion; // TODO: Enable after layer is built

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // =============================================================================
    // JUNOKIT CORE INFRASTRUCTURE - Stockholm Region (eu-north-1)
    // =============================================================================

    // 📊 DynamoDB Table - User Context & Memory
    this.userContextTable = new dynamodb.Table(this, 'UserContextTable', {
      tableName: 'junokit-user-context-v2',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // Cost-effective for MVP
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Protect user data
      pointInTimeRecovery: true, // GDPR compliance - data recovery
      encryption: dynamodb.TableEncryption.AWS_MANAGED, // Data encryption
      timeToLiveAttribute: 'ttl', // Auto-cleanup for ephemeral data
    });

    // 💬 DynamoDB Table - Chat Messages & Conversations
    const chatTable = new dynamodb.Table(this, 'ChatTable', {
      tableName: 'junokit-chat-messages',
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'SK',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecovery: true,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      timeToLiveAttribute: 'ttl',
    });

    // Add GSI for user conversations
    chatTable.addGlobalSecondaryIndex({
      indexName: 'UserConversationsIndex',
      partitionKey: {
        name: 'GSI1PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'GSI1SK',
        type: dynamodb.AttributeType.STRING,
      },
    });

    // 🔄 DynamoDB Table - WebSocket Connections
    this.connectionsTable = new dynamodb.Table(this, 'WebSocketConnectionsTable', {
      tableName: 'junokit-websocket-connections',
      partitionKey: {
        name: 'connectionId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Connections are ephemeral
      timeToLiveAttribute: 'ttl', // Auto-cleanup stale connections
    });

    // Add GSI for user connections lookup
    this.connectionsTable.addGlobalSecondaryIndex({
      indexName: 'UserConnectionsIndex',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'connectionId',
        type: dynamodb.AttributeType.STRING,
      },
    });

    // 🔐 Cognito User Pool - Authentication with Invite Codes
    this.userPool = new cognito.UserPool(this, 'JunokitUserPool', {
      userPoolName: 'junokit-users',
      signInAliases: {
        email: true,
        username: false,
        phone: false,
      },
      selfSignUpEnabled: false, // Invite-only system
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        givenName: {
          required: true,
          mutable: true,
        },
        familyName: {
          required: true,
          mutable: true,
        },
      },
      customAttributes: {
        inviteCode: new cognito.StringAttribute({
          minLen: 6,
          maxLen: 20,
          mutable: false,
        }),
        userRole: new cognito.StringAttribute({
          minLen: 2,
          maxLen: 20,
          mutable: true,
        }),
        theme: new cognito.StringAttribute({
          minLen: 2,
          maxLen: 20,
          mutable: true,
        }),
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Protect user accounts
    });

    // Cognito User Pool Client
    this.userPoolClient = new cognito.UserPoolClient(this, 'JunokitUserPoolClient', {
      userPool: this.userPool,
      userPoolClientName: 'junokit-web-client',
      generateSecret: false, // For web applications
      authFlows: {
        userSrp: true,
        userPassword: false, // More secure
        adminUserPassword: true, // For invite system
      },
      // Remove OAuth configuration to use direct access tokens
      refreshTokenValidity: cdk.Duration.days(30),
      accessTokenValidity: cdk.Duration.hours(1),
      idTokenValidity: cdk.Duration.hours(1),
    });

    // 🌐 API Gateway - REST API for Frontend
    this.api = new apigateway.RestApi(this, 'JunokitApi', {
      restApiName: 'junokit-api',
      description: 'Junokit AI Work Assistant API',
      defaultCorsPreflightOptions: {
        allowOrigins: [
          'http://localhost:3000',      // Development
          'http://localhost:3005',      // Alternative dev port
          'https://junokit.com',        // Production
          'https://www.junokit.com',    // WWW redirect
        ],
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
      },
      deployOptions: {
        stageName: 'v1',
        throttlingRateLimit: 1000, // Requests per second
        throttlingBurstLimit: 2000, // Burst capacity
        loggingLevel: apigateway.MethodLoggingLevel.OFF, // Disabled until CloudWatch role is set
        dataTraceEnabled: false, // Disabled until CloudWatch role is set
        metricsEnabled: true, // Basic metrics don't require CloudWatch role
      },
    });

    // 📧 SES Email Configuration - Notifications & Reminders
    const sesIdentity = new ses.EmailIdentity(this, 'JunokitEmailIdentity', {
      identity: ses.Identity.domain('junokit.com'), // Configure your domain
      feedbackForwarding: true,
    });

    // 🔑 Secrets Manager - API Keys & Sensitive Configuration
    const apiSecrets = new secretsmanager.Secret(this, 'JunokitApiSecrets', {
      secretName: 'junokit-api-secrets',
      description: 'Junokit API keys and sensitive configuration',
              generateSecretString: {
        secretStringTemplate: JSON.stringify({
          openRouterApiKey: '',
          slackBotToken: '',
          slackClientId: '',
          slackClientSecret: '',
          githubToken: '',
          googleClientId: '',
          googleClientSecret: '',
        }),
        generateStringKey: 'autoGenerated',
        excludeCharacters: '"@/\\',
      },
    });

    // 📊 CloudWatch Log Groups - Centralized Logging
    const apiLogGroup = new logs.LogGroup(this, 'JunokitApiLogs', {
      logGroupName: '/aws/apigateway/junokit-api',
      retention: logs.RetentionDays.ONE_MONTH, // Cost-effective retention
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Keep logs for debugging
    });

    const lambdaLogGroup = new logs.LogGroup(this, 'JunokitLambdaLogs', {
      logGroupName: '/aws/lambda/junokit',
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // 🔐 IAM Role - Lambda Execution Role with Least Privilege
    this.lambdaExecutionRole = new iam.Role(this, 'JunokitLambdaExecutionRole', {
      roleName: 'junokit-lambda-execution-role',
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Execution role for Junokit Lambda functions',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
      inlinePolicies: {
        JunokitLambdaPolicy: new iam.PolicyDocument({
          statements: [
            // DynamoDB permissions
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'dynamodb:GetItem',
                'dynamodb:PutItem',
                'dynamodb:UpdateItem',
                'dynamodb:DeleteItem',
                'dynamodb:Query',
                'dynamodb:Scan',
              ],
              resources: [
                this.userContextTable.tableArn,
                `${this.userContextTable.tableArn}/index/*`,
                chatTable.tableArn,
                `${chatTable.tableArn}/index/*`,
                this.connectionsTable.tableArn,
                `${this.connectionsTable.tableArn}/index/*`,
              ],
            }),
            // Secrets Manager permissions
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'secretsmanager:GetSecretValue',
                'secretsmanager:DescribeSecret',
              ],
              resources: [apiSecrets.secretArn],
            }),
            // Cognito permissions
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'cognito-idp:AdminGetUser',
                'cognito-idp:AdminCreateUser',
                'cognito-idp:AdminSetUserPassword',
                'cognito-idp:AdminUpdateUserAttributes',
              ],
              resources: [this.userPool.userPoolArn],
            }),
            // SES permissions
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'ses:SendEmail',
                'ses:SendRawEmail',
              ],
              resources: ['*'], // SES requires wildcard for email sending
              conditions: {
                StringEquals: {
                  'ses:FromAddress': 'noreply@junokit.com',
                },
              },
            }),
            // CloudWatch Logs permissions
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'logs:CreateLogGroup',
                'logs:CreateLogStream',
                'logs:PutLogEvents',
              ],
              resources: [
                lambdaLogGroup.logGroupArn,
                `${lambdaLogGroup.logGroupArn}:*`,
              ],
            }),
            // WebSocket API Gateway permissions
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'execute-api:ManageConnections',
              ],
              resources: [
                `arn:aws:execute-api:${this.region}:${this.account}:*`,
              ],
            }),
          ],
        }),
      },
    });

    // 📦 Lambda Layer - Shared Utilities & Dependencies 
    // TODO: Deploy layer separately after building node_modules
    // this.sharedLambdaLayer = new lambda.LayerVersion(this, 'JunokitSharedLayer', {
    //   layerVersionName: 'junokit-shared-utilities', 
    //   description: 'Shared utilities, AWS SDK, and common dependencies for Junokit Lambda functions',
    //   code: lambda.Code.fromAsset('../../backend/layers/shared'),
    //   compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
    //   removalPolicy: cdk.RemovalPolicy.RETAIN,
    // });

    // 🔧 Lambda Functions - Core API Endpoints
    
    // User Profile Lambda Function
    const userProfileFunction = new lambda.Function(this, 'UserProfileFunction', {
      functionName: 'junokit-user-profile',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'user-profile.handler',
      code: lambda.Code.fromAsset('../../backend/functions/auth', {
        bundling: {
          image: lambda.Runtime.NODEJS_20_X.bundlingImage,
          command: [
            'bash', '-c', [
              'cp -r /asset-input/* /asset-output/',
              'cd /asset-output',
              'npm install aws-sdk @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb aws-jwt-verify @types/aws-lambda',
            ].join(' && '),
          ],
          local: {
            tryBundle(outputDir: string) {
              try {
                // Copy source files
                const fs = require('fs');
                const path = require('path');
                const { execSync } = require('child_process');
                
                // Get the correct path from CDK lib directory to backend functions
                const sourceDir = '../../../backend/functions/auth';
                const fullSourcePath = path.resolve(__dirname, sourceDir);
                
                console.log(`Copying from: ${fullSourcePath} to: ${outputDir}`);
                
                // Copy all files from source to output
                execSync(`cp -r ${fullSourcePath}/* ${outputDir}/`, { stdio: 'inherit' });
                
                // Install dependencies in output directory
                execSync('npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb aws-jwt-verify @types/aws-lambda', {
                  cwd: outputDir,
                  stdio: 'inherit'
                });
                
                return true; // Bundling succeeded
              } catch (error) {
                console.error('Local bundling failed:', error);
                return false; // Fall back to Docker
              }
            }
          }
        },
      }),
      role: this.lambdaExecutionRole,
      environment: {
        USER_CONTEXT_TABLE: this.userContextTable.tableName,
        USER_POOL_ID: this.userPool.userPoolId,
        USER_POOL_CLIENT_ID: this.userPoolClient.userPoolClientId,
        REGION: this.region,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      logGroup: lambdaLogGroup,
    });

    // API Gateway Integration - User Profile Endpoints
    const userResource = this.api.root.addResource('user');
    const profileResource = userResource.addResource('profile');
    
    // GET /user/profile - Get user profile
    profileResource.addMethod('GET', new apigateway.LambdaIntegration(userProfileFunction), {
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer: new apigateway.CognitoUserPoolsAuthorizer(this, 'UserProfileAuthorizer', {
        cognitoUserPools: [this.userPool],
      }),
    });

    // PUT /user/profile - Update user profile  
    profileResource.addMethod('PUT', new apigateway.LambdaIntegration(userProfileFunction), {
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer: new apigateway.CognitoUserPoolsAuthorizer(this, 'UserProfileUpdateAuthorizer', {
        cognitoUserPools: [this.userPool],
      }),
    });

    // CORS is handled automatically by defaultCorsPreflightOptions

    // =============================================================================
    // SLACK INTEGRATION FUNCTIONS
    // =============================================================================

    // Slack OAuth Lambda Function
    const slackOAuthFunction = new lambda.Function(this, 'SlackOAuthFunction', {
      functionName: 'junokit-slack-oauth',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'slack-oauth.handler',
      code: lambda.Code.fromAsset('../../backend/functions/integrations', {
        bundling: {
          image: lambda.Runtime.NODEJS_20_X.bundlingImage,
          command: [
            'bash', '-c', [
              'cp -r /asset-input/* /asset-output/',
              'cd /asset-output',
              'npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb @aws-sdk/client-secrets-manager aws-jwt-verify @types/aws-lambda',
            ].join(' && '),
          ],
          local: {
            tryBundle(outputDir: string) {
              try {
                const fs = require('fs');
                const path = require('path');
                const { execSync } = require('child_process');
                
                const sourceDir = '../../../backend/functions/integrations';
                const fullSourcePath = path.resolve(__dirname, sourceDir);
                
                console.log(`Copying from: ${fullSourcePath} to: ${outputDir}`);
                
                execSync(`cp -r ${fullSourcePath}/* ${outputDir}/`, { stdio: 'inherit' });
                
                execSync('npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb @aws-sdk/client-secrets-manager aws-jwt-verify @types/aws-lambda', {
                  cwd: outputDir,
                  stdio: 'inherit'
                });
                
                return true;
              } catch (error) {
                console.error('Local bundling failed:', error);
                return false;
              }
            }
          }
        },
      }),
      role: this.lambdaExecutionRole,
      environment: {
        USER_CONTEXT_TABLE: this.userContextTable.tableName,
        USER_POOL_ID: this.userPool.userPoolId,
        USER_POOL_CLIENT_ID: this.userPoolClient.userPoolClientId,
        REGION: this.region,
        API_SECRETS_ARN: apiSecrets.secretArn,
        FRONTEND_URL: process.env.FRONTEND_URL || 'https://app.junokit.com',
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      logGroup: lambdaLogGroup,
    });

    // Slack Messaging Lambda Function
    const slackMessagingFunction = new lambda.Function(this, 'SlackMessagingFunction', {
      functionName: 'junokit-slack-messaging',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'slack-messaging.handler',
      code: lambda.Code.fromAsset('../../backend/functions/integrations', {
        bundling: {
          image: lambda.Runtime.NODEJS_20_X.bundlingImage,
          command: [
            'bash', '-c', [
              'cp -r /asset-input/* /asset-output/',
              'cd /asset-output',
              'npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb aws-jwt-verify @types/aws-lambda',
            ].join(' && '),
          ],
          local: {
            tryBundle(outputDir: string) {
              try {
                const fs = require('fs');
                const path = require('path');
                const { execSync } = require('child_process');
                
                const sourceDir = '../../../backend/functions/integrations';
                const fullSourcePath = path.resolve(__dirname, sourceDir);
                
                console.log(`Copying from: ${fullSourcePath} to: ${outputDir}`);
                
                execSync(`cp -r ${fullSourcePath}/* ${outputDir}/`, { stdio: 'inherit' });
                
                execSync('npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb aws-jwt-verify @types/aws-lambda', {
                  cwd: outputDir,
                  stdio: 'inherit'
                });
                
                return true;
              } catch (error) {
                console.error('Local bundling failed:', error);
                return false;
              }
            }
          }
        },
      }),
      role: this.lambdaExecutionRole,
      environment: {
        USER_CONTEXT_TABLE: this.userContextTable.tableName,
        USER_POOL_ID: this.userPool.userPoolId,
        USER_POOL_CLIENT_ID: this.userPoolClient.userPoolClientId,
        REGION: this.region,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      logGroup: lambdaLogGroup,
    });

    // API Gateway Integration - Slack Endpoints
    const integrationsResource = this.api.root.addResource('integrations');
    const slackResource = integrationsResource.addResource('slack');
    
    // Slack OAuth endpoints
    const slackAuthResource = slackResource.addResource('auth');
    slackAuthResource.addMethod('GET', new apigateway.LambdaIntegration(slackOAuthFunction), {
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer: new apigateway.CognitoUserPoolsAuthorizer(this, 'SlackAuthAuthorizer', {
        cognitoUserPools: [this.userPool],
      }),
    });

    const slackCallbackResource = slackResource.addResource('callback');
    slackCallbackResource.addMethod('GET', new apigateway.LambdaIntegration(slackOAuthFunction));

    const slackStatusResource = slackResource.addResource('status');
    slackStatusResource.addMethod('GET', new apigateway.LambdaIntegration(slackOAuthFunction), {
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer: new apigateway.CognitoUserPoolsAuthorizer(this, 'SlackStatusAuthorizer', {
        cognitoUserPools: [this.userPool],
      }),
    });

    const slackDisconnectResource = slackResource.addResource('disconnect');
    slackDisconnectResource.addMethod('DELETE', new apigateway.LambdaIntegration(slackOAuthFunction), {
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer: new apigateway.CognitoUserPoolsAuthorizer(this, 'SlackDisconnectAuthorizer', {
        cognitoUserPools: [this.userPool],
      }),
    });

    // Slack messaging endpoints
    const slackSendResource = slackResource.addResource('send');
    slackSendResource.addMethod('POST', new apigateway.LambdaIntegration(slackMessagingFunction), {
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer: new apigateway.CognitoUserPoolsAuthorizer(this, 'SlackSendAuthorizer', {
        cognitoUserPools: [this.userPool],
      }),
    });

    const slackChannelsResource = slackResource.addResource('channels');
    slackChannelsResource.addMethod('GET', new apigateway.LambdaIntegration(slackMessagingFunction), {
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer: new apigateway.CognitoUserPoolsAuthorizer(this, 'SlackChannelsAuthorizer', {
        cognitoUserPools: [this.userPool],
      }),
    });

    const slackUsersResource = slackResource.addResource('users');
    slackUsersResource.addMethod('GET', new apigateway.LambdaIntegration(slackMessagingFunction), {
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer: new apigateway.CognitoUserPoolsAuthorizer(this, 'SlackUsersAuthorizer', {
        cognitoUserPools: [this.userPool],
      }),
    });

    // AI Chat Lambda Function
    const aiChatFunction = new lambda.Function(this, 'AiChatFunction', {
      functionName: 'junokit-ai-chat',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../../backend/functions/chat', {
        bundling: {
          image: lambda.Runtime.NODEJS_20_X.bundlingImage,
          command: [
            'bash', '-c', [
              'cp -r /asset-input/* /asset-output/',
              'cd /asset-output',
              'npm install --production @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb @aws-sdk/client-secrets-manager aws-jwt-verify',
              'npm install --save-dev typescript @types/aws-lambda',
              'npx tsc ai-chat.ts --target es2020 --module commonjs --outDir . --esModuleInterop --skipLibCheck',
              'mv ai-chat.js index.js',
              'rm -f ai-chat.ts *.d.ts',
            ].join(' && '),
          ],
          local: {
            tryBundle(outputDir: string) {
              try {
                const fs = require('fs');
                const path = require('path');
                const { execSync } = require('child_process');
                
                const sourceDir = '../../../backend/functions/chat';
                const fullSourcePath = path.resolve(__dirname, sourceDir);
                
                console.log(`Copying from: ${fullSourcePath} to: ${outputDir}`);
                
                execSync(`cp -r ${fullSourcePath}/* ${outputDir}/`, { stdio: 'inherit' });
                
                // Install production dependencies
                execSync('npm install --production @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb @aws-sdk/client-secrets-manager aws-jwt-verify', {
                  cwd: outputDir,
                  stdio: 'inherit'
                });
                
                // Install dev dependencies for compilation
                execSync('npm install --save-dev typescript @types/aws-lambda', {
                  cwd: outputDir,
                  stdio: 'inherit'
                });
                
                // Compile TypeScript to JavaScript
                execSync('npx tsc ai-chat.ts --target es2020 --module commonjs --outDir . --esModuleInterop --skipLibCheck', {
                  cwd: outputDir,
                  stdio: 'inherit'
                });
                
                // Rename to index.js for Lambda handler
                execSync('mv ai-chat.js index.js', {
                  cwd: outputDir,
                  stdio: 'inherit'
                });
                
                // Clean up TypeScript files
                execSync('rm -f ai-chat.ts *.d.ts', {
                  cwd: outputDir,
                  stdio: 'inherit'
                });
                
                return true;
              } catch (error) {
                console.error('Local bundling failed:', error);
                return false;
              }
            }
          }
        },
      }),
      role: this.lambdaExecutionRole,
      environment: {
        USER_POOL_ID: this.userPool.userPoolId,
        USER_POOL_CLIENT_ID: this.userPoolClient.userPoolClientId,
        CHAT_TABLE: chatTable.tableName,
        API_SECRETS_ARN: apiSecrets.secretArn,
        REGION: this.region,
      },
      timeout: cdk.Duration.seconds(60), // Longer timeout for AI responses
      memorySize: 512, // More memory for AI processing
      logGroup: lambdaLogGroup,
    });

    // API Gateway Integration - Chat Endpoints
    const chatResource = this.api.root.addResource('chat');
    
    // GET /chat - Get user conversations (Lambda-based auth)
    chatResource.addMethod('GET', new apigateway.LambdaIntegration(aiChatFunction));

    // POST /chat - Create new chat message (Lambda-based auth)
    chatResource.addMethod('POST', new apigateway.LambdaIntegration(aiChatFunction));

    // GET /chat/{conversationId} - Get conversation messages (Lambda-based auth)
    const conversationResource = chatResource.addResource('{conversationId}');
    conversationResource.addMethod('GET', new apigateway.LambdaIntegration(aiChatFunction));
    
    // DELETE /chat/{conversationId} - Delete conversation (Lambda-based auth)
    conversationResource.addMethod('DELETE', new apigateway.LambdaIntegration(aiChatFunction));
    
    // PUT /chat/{conversationId} - Update conversation title (Lambda-based auth)
    conversationResource.addMethod('PUT', new apigateway.LambdaIntegration(aiChatFunction));

    // =============================================================================
    // WEBSOCKET API - Real-time Features
    // =============================================================================

    // WebSocket Connect Lambda Function
    const webSocketConnectFunction = new lambda.Function(this, 'WebSocketConnectFunction', {
      functionName: 'junokit-websocket-connect',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'connect.handler',
      code: lambda.Code.fromAsset('../../backend/functions/websocket', {
        bundling: {
          image: lambda.Runtime.NODEJS_20_X.bundlingImage,
          command: [
            'bash', '-c', [
              'cp -r /asset-input/* /asset-output/',
              'cd /asset-output',
              'npm install --production @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb aws-jwt-verify',
            ].join(' && '),
          ],
          local: {
            tryBundle(outputDir: string) {
              try {
                const fs = require('fs');
                const path = require('path');
                const { execSync } = require('child_process');
                
                const sourceDir = '../../../backend/functions/websocket';
                const fullSourcePath = path.resolve(__dirname, sourceDir);
                
                console.log(`Copying from: ${fullSourcePath} to: ${outputDir}`);
                
                execSync(`cp -r ${fullSourcePath}/* ${outputDir}/`, { stdio: 'inherit' });
                
                execSync('npm install --production @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb aws-jwt-verify', {
                  cwd: outputDir,
                  stdio: 'inherit'
                });
                
                return true;
              } catch (error) {
                console.error('Local bundling failed:', error);
                return false;
              }
            }
          }
        },
      }),
      role: this.lambdaExecutionRole,
      environment: {
        CONNECTIONS_TABLE: this.connectionsTable.tableName,
        USER_POOL_ID: this.userPool.userPoolId,
        REGION: this.region,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      logGroup: lambdaLogGroup,
    });

    // WebSocket Disconnect Lambda Function
    const webSocketDisconnectFunction = new lambda.Function(this, 'WebSocketDisconnectFunction', {
      functionName: 'junokit-websocket-disconnect',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'disconnect.handler',
      code: lambda.Code.fromAsset('../../backend/functions/websocket'),
      role: this.lambdaExecutionRole,
      environment: {
        CONNECTIONS_TABLE: this.connectionsTable.tableName,
        REGION: this.region,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      logGroup: lambdaLogGroup,
    });

    // WebSocket Message Handler Lambda Function
    const webSocketMessageFunction = new lambda.Function(this, 'WebSocketMessageFunction', {
      functionName: 'junokit-websocket-message',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'message.handler',
      code: lambda.Code.fromAsset('../../backend/functions/websocket'),
      role: this.lambdaExecutionRole,
      environment: {
        CONNECTIONS_TABLE: this.connectionsTable.tableName,
        CHAT_TABLE: chatTable.tableName,
        API_SECRETS_ARN: apiSecrets.secretArn,
        USER_POOL_ID: this.userPool.userPoolId,
        REGION: this.region,
      },
      timeout: cdk.Duration.seconds(60),
      memorySize: 512,
      logGroup: lambdaLogGroup,
    });

    // WebSocket API Gateway
    this.webSocketApi = new apigatewayv2.WebSocketApi(this, 'JunokitWebSocketApi', {
      apiName: 'junokit-websocket-api',
      description: 'Junokit Real-time WebSocket API',
    });

    // WebSocket Routes with Lambda integrations
    new apigatewayv2.WebSocketRoute(this, 'ConnectRoute', {
      webSocketApi: this.webSocketApi,
      routeKey: '$connect',
      integration: new integrations.WebSocketLambdaIntegration('ConnectIntegration', webSocketConnectFunction),
    });

    new apigatewayv2.WebSocketRoute(this, 'DisconnectRoute', {
      webSocketApi: this.webSocketApi,
      routeKey: '$disconnect',
      integration: new integrations.WebSocketLambdaIntegration('DisconnectIntegration', webSocketDisconnectFunction),
    });

    new apigatewayv2.WebSocketRoute(this, 'DefaultRoute', {
      webSocketApi: this.webSocketApi,
      routeKey: '$default',
      integration: new integrations.WebSocketLambdaIntegration('MessageIntegration', webSocketMessageFunction),
    });

    // WebSocket API Stage
    this.webSocketStage = new apigatewayv2.WebSocketStage(this, 'JunokitWebSocketStage', {
      webSocketApi: this.webSocketApi,
      stageName: 'v1',
      autoDeploy: true,
    });

    // Grant WebSocket API permissions to Lambda functions
    webSocketConnectFunction.addPermission('AllowWebSocketConnect', {
      principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      sourceArn: `arn:aws:execute-api:${this.region}:${this.account}:${this.webSocketApi.apiId}/*/*`,
    });

    webSocketDisconnectFunction.addPermission('AllowWebSocketDisconnect', {
      principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      sourceArn: `arn:aws:execute-api:${this.region}:${this.account}:${this.webSocketApi.apiId}/*/*`,
    });

    webSocketMessageFunction.addPermission('AllowWebSocketMessage', {
      principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      sourceArn: `arn:aws:execute-api:${this.region}:${this.account}:${this.webSocketApi.apiId}/*/*`,
    });

    // 📈 CloudWatch Alarms - Error Monitoring
    const lambdaErrorAlarm = new logs.MetricFilter(this, 'JunokitLambdaErrors', {
      logGroup: lambdaLogGroup,
      metricNamespace: 'Junokit/Lambda',
      metricName: 'ErrorCount',
      filterPattern: logs.FilterPattern.literal('[timestamp, requestId, level="ERROR", ...]'),
      metricValue: '1',
    });

    // =============================================================================
    // OUTPUTS - For Frontend and Lambda Functions
    // =============================================================================

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
      exportName: 'JunokitUserPoolId',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
      exportName: 'JunokitUserPoolClientId',
    });

    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: this.api.url,
      description: 'API Gateway URL',
      exportName: 'JunokitApiUrl',
    });

    new cdk.CfnOutput(this, 'UserContextTableName', {
      value: this.userContextTable.tableName,
      description: 'DynamoDB User Context Table Name',
      exportName: 'JunokitUserContextTable',
    });

    new cdk.CfnOutput(this, 'ChatTableName', {
      value: chatTable.tableName,
      description: 'DynamoDB Chat Messages Table Name',
      exportName: 'JunokitChatTable',
    });

    new cdk.CfnOutput(this, 'ApiSecretsArn', {
      value: apiSecrets.secretArn,
      description: 'Secrets Manager ARN for API keys',
      exportName: 'JunokitApiSecretsArn',
    });

    new cdk.CfnOutput(this, 'LambdaExecutionRoleArn', {
      value: this.lambdaExecutionRole.roleArn,
      description: 'Lambda execution role ARN',
      exportName: 'JunokitLambdaExecutionRoleArn',
    });

    // TODO: Uncomment after layer is implemented
    // new cdk.CfnOutput(this, 'SharedLambdaLayerArn', {
    //   value: this.sharedLambdaLayer.layerVersionArn,
    //   description: 'Shared Lambda layer ARN',
    //   exportName: 'JunokitSharedLambdaLayerArn',
    // });

    new cdk.CfnOutput(this, 'LambdaLogGroupName', {
      value: lambdaLogGroup.logGroupName,
      description: 'CloudWatch log group for Lambda functions',
      exportName: 'JunokitLambdaLogGroupName',
    });

    new cdk.CfnOutput(this, 'WebSocketApiUrl', {
      value: `wss://${this.webSocketApi.apiId}.execute-api.${this.region}.amazonaws.com/v1`,
      description: 'WebSocket API URL',
      exportName: 'JunokitWebSocketApiUrl',
    });

    new cdk.CfnOutput(this, 'WebSocketApiId', {
      value: this.webSocketApi.apiId,
      description: 'WebSocket API ID',
      exportName: 'JunokitWebSocketApiId',
    });

    new cdk.CfnOutput(this, 'ConnectionsTableName', {
      value: this.connectionsTable.tableName,
      description: 'DynamoDB WebSocket Connections Table Name',
      exportName: 'JunokitConnectionsTable',
    });

    // =============================================================================
    // TAGS - Cost Management & Organization
    // =============================================================================
    cdk.Tags.of(this).add('Project', 'Junokit');
    cdk.Tags.of(this).add('Environment', 'production');
    cdk.Tags.of(this).add('Region', 'eu-north-1');
    cdk.Tags.of(this).add('CostCenter', 'junokit-infra');
  }
}
