/**
 * AWS Configuration for Junokit
 * Contains all AWS service configurations from deployed infrastructure
 */

import { Amplify } from 'aws-amplify';

// AWS Infrastructure Configuration (Stockholm - eu-north-1)
export const awsConfig = {
  region: 'eu-north-1',
  
  // Cognito Configuration
  cognito: {
    userPoolId: 'eu-north-1_QUaZ7e7OU',
    userPoolClientId: '66ako4srqdk2aghompd956bloa',
    region: 'eu-north-1',
  },
  
  // API Gateway Configuration
  api: {
    baseUrl: 'https://nayr2j5df2.execute-api.eu-north-1.amazonaws.com/v1',
    region: 'eu-north-1',
  },
  
  // Application Configuration
  app: {
    name: 'Junokit',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
  
  // Feature Flags
  features: {
    enableThemes: true,
    enableChat: true,
    enableNotifications: true,
  },
  
  // Theme System Configuration
  themes: {
    default: 'general',
    available: ['general'] as const,
  },
};

// Amplify Configuration
export const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: awsConfig.cognito.userPoolId,
      userPoolClientId: awsConfig.cognito.userPoolClientId,
      region: awsConfig.cognito.region,
      loginWith: {
        email: true,
        username: false,
        phone: false,
      },
      signUpVerificationMethod: 'code' as const,
      userAttributes: {
        email: {
          required: true,
        },
        given_name: {
          required: true,
        },
        family_name: {
          required: true,
        },
      },
      allowGuestAccess: false,
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: false,
      },
    },
  },
  API: {
    REST: {
      JunokitAPI: {
        endpoint: awsConfig.api.baseUrl,
        region: awsConfig.api.region,
      },
    },
  },
};

// Initialize Amplify
export const configureAmplify = () => {
  Amplify.configure(amplifyConfig);
};

// Theme Type Definitions
export type ThemeType = typeof awsConfig.themes.available[number];

export interface UserTheme {
  id: ThemeType;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
}

// Theme Configurations
export const themeConfigurations: Record<ThemeType, UserTheme> = {
  general: {
    id: 'general',
    name: 'AI Assistant',
    description: 'Your intelligent AI companion for any task or question',
    primaryColor: 'purple',
    secondaryColor: 'violet',
  },
};

export default awsConfig; 