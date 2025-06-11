#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { JunokitInfraStack } from '../lib/junokit-infra-stack';

const app = new cdk.App();

// Junokit Infrastructure - Stockholm Region (eu-north-1)
// Stockholm is cost-effective and GDPR compliant (EU region)
new JunokitInfraStack(app, 'JunokitInfraStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'eu-north-1', // Stockholm - cheapest EU region
  },
  description: 'Junokit AI Work Assistant - Core Infrastructure',
  tags: {
    Project: 'Junokit',
    Environment: 'production',
    CostCenter: 'junokit-infra',
    Owner: 'junokit-team',
  },
});