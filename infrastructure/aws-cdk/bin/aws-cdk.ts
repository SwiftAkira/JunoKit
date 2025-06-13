#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { JunokitInfraStack } from '../lib/junokit-infra-stack';
import { JunokitAppRunnerStack } from '../lib/junokit-apprunner-stack';

const app = new cdk.App();

// Main infrastructure stack in Stockholm (eu-north-1) for GDPR compliance
const infraStack = new JunokitInfraStack(app, 'JunokitInfraStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'eu-north-1', // Stockholm - GDPR compliant region
  },
  description: 'Junokit AI Assistant - Main Infrastructure Stack (Stockholm)',
});

// App Runner stack in Ireland (eu-west-1) - closest EU region with App Runner support
const appRunnerStack = new JunokitAppRunnerStack(app, 'JunokitAppRunnerStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'eu-west-1', // Ireland - App Runner supported region
  },
  description: 'Junokit AI Assistant - Frontend App Runner Stack (Ireland)',
});

// Add dependency to ensure backend is deployed before frontend
appRunnerStack.addDependency(infraStack);

// Add tags to the app
cdk.Tags.of(app).add('Project', 'Junokit');
cdk.Tags.of(app).add('Environment', 'production');
cdk.Tags.of(app).add('ManagedBy', 'CDK');