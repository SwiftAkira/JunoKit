import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ses from 'aws-cdk-lib/aws-ses';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class JunokitInfraStack extends cdk.Stack {
  public readonly userContextTable: dynamodb.Table;
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // =============================================================================
    // JUNOKIT CORE INFRASTRUCTURE - Stockholm Region (eu-north-1)
    // =============================================================================

    // 📊 DynamoDB Table - User Context & Memory
    this.userContextTable = new dynamodb.Table(this, 'UserContextTable', {
      tableName: 'junokit-user-context',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'contextType',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // Cost-effective for MVP
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Protect user data
      pointInTimeRecovery: true, // GDPR compliance - data recovery
      encryption: dynamodb.TableEncryption.AWS_MANAGED, // Data encryption
      timeToLiveAttribute: 'ttl', // Auto-cleanup for ephemeral data
    });

    // Add GSI for efficient querying
    this.userContextTable.addGlobalSecondaryIndex({
      indexName: 'context-type-index',
      partitionKey: {
        name: 'contextType',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
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
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        metricsEnabled: true,
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

    // =============================================================================
    // TAGS - Cost Management & Organization
    // =============================================================================
    cdk.Tags.of(this).add('Project', 'Junokit');
    cdk.Tags.of(this).add('Environment', 'production');
    cdk.Tags.of(this).add('Region', 'eu-north-1');
    cdk.Tags.of(this).add('CostCenter', 'junokit-infra');
  }
}
