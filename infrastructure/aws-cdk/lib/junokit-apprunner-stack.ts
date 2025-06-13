import * as cdk from 'aws-cdk-lib';
import * as apprunner from 'aws-cdk-lib/aws-apprunner';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class JunokitAppRunnerStack extends cdk.Stack {
  public readonly appRunnerService: apprunner.CfnService;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // =============================================================================
    // JUNOKIT APP RUNNER - EU West 1 (Ireland) Region
    // =============================================================================

    // 🚀 App Runner Instance Role
    const appRunnerInstanceRole = new iam.Role(this, 'AppRunnerInstanceRole', {
      assumedBy: new iam.ServicePrincipal('tasks.apprunner.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMReadOnlyAccess'),
      ],
    });

    // Removed App Runner Access Role - using public GitHub repository doesn't require additional permissions

    // 🚀 App Runner Service
    this.appRunnerService = new apprunner.CfnService(this, 'JunokitAppRunnerService', {
      serviceName: 'junokit-frontend',
      sourceConfiguration: {
        autoDeploymentsEnabled: true,
        codeRepository: {
          repositoryUrl: 'https://github.com/SwiftAkira/JunoKit',
          sourceCodeVersion: {
            type: 'BRANCH',
            value: 'main',
          },
          codeConfiguration: {
            configurationSource: 'REPOSITORY', // Using apprunner.yml in repo
          },
        },
      },
      instanceConfiguration: {
        cpu: '1 vCPU',
        memory: '2 GB',
        instanceRoleArn: appRunnerInstanceRole.roleArn,
      },
      networkConfiguration: {
        egressConfiguration: {
          egressType: 'DEFAULT', // Allow outbound internet access
        },
      },
      healthCheckConfiguration: {
        protocol: 'HTTP',
        path: '/',
        interval: 10,
        timeout: 5,
        healthyThreshold: 1,
        unhealthyThreshold: 5,
      },
    });

    // =============================================================================
    // OUTPUTS
    // =============================================================================

    new cdk.CfnOutput(this, 'AppRunnerServiceUrl', {
      value: `https://${this.appRunnerService.attrServiceUrl}`,
      description: 'App Runner Service URL for Frontend (EU West 1)',
      exportName: 'JunokitAppRunnerUrl',
    });

    new cdk.CfnOutput(this, 'AppRunnerServiceArn', {
      value: this.appRunnerService.attrServiceArn,
      description: 'App Runner Service ARN',
      exportName: 'JunokitAppRunnerArn',
    });

    new cdk.CfnOutput(this, 'AppRunnerServiceId', {
      value: this.appRunnerService.attrServiceId,
      description: 'App Runner Service ID',
      exportName: 'JunokitAppRunnerServiceId',
    });

    // =============================================================================
    // TAGS
    // =============================================================================
    cdk.Tags.of(this).add('Project', 'Junokit');
    cdk.Tags.of(this).add('Environment', 'production');
    cdk.Tags.of(this).add('Region', 'eu-west-1');
    cdk.Tags.of(this).add('Component', 'frontend');
    cdk.Tags.of(this).add('CostCenter', 'junokit-frontend');
  }
} 