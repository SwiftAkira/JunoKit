import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
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
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
      },
      refreshTokenValidity: cdk.Duration.days(30),
      accessTokenValidity: cdk.Duration.hours(1),
      idTokenValidity: cdk.Duration.hours(1),
    });

    // 🌐 API Gateway - REST API for Frontend
    this.api = new apigateway.RestApi(this, 'JunokitApi', {
      restApiName: 'junokit-api',
      description: 'Junokit AI Work Assistant API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS, // Configure properly for production
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

    // =============================================================================
    // TAGS - Cost Management & Organization
    // =============================================================================
    cdk.Tags.of(this).add('Project', 'Junokit');
    cdk.Tags.of(this).add('Environment', 'production');
    cdk.Tags.of(this).add('Region', 'eu-north-1');
    cdk.Tags.of(this).add('CostCenter', 'junokit-infra');
  }
}
