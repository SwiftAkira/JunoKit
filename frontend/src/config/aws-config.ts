// AWS Configuration and Theme Types
export type ThemeType = 'general' | 'tech' | 'business' | 'creative' | 'academic';

export interface UserTheme {
  id: ThemeType;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  icon: string;
}

export const themeConfigurations: Record<ThemeType, UserTheme> = {
  general: {
    id: 'general',
    name: 'General',
    description: 'Clean and professional theme for general use',
    primaryColor: 'blue',
    secondaryColor: 'cyan',
    icon: '🎯',
  },
  tech: {
    id: 'tech',
    name: 'Tech',
    description: 'Dark theme optimized for developers and tech professionals',
    primaryColor: 'green',
    secondaryColor: 'emerald',
    icon: '💻',
  },
  business: {
    id: 'business',
    name: 'Business',
    description: 'Professional theme for business and corporate use',
    primaryColor: 'purple',
    secondaryColor: 'violet',
    icon: '💼',
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    description: 'Vibrant theme for creative professionals and artists',
    primaryColor: 'orange',
    secondaryColor: 'amber',
    icon: '🎨',
  },
  academic: {
    id: 'academic',
    name: 'Academic',
    description: 'Focused theme for students and academic professionals',
    primaryColor: 'pink',
    secondaryColor: 'rose',
    icon: '📚',
  },
};

// Production-ready AWS Configuration
// Automatically detects environment and uses correct settings
const getAWSConfig = () => {
  // Production configuration
  const config = {
    region: 'eu-north-1',
    userPoolId: 'eu-north-1_QUaZ7e7OU',
    userPoolWebClientId: '66ako4srqdk2aghompd956bloa',
    apiGatewayUrl: 'https://nayr2j5df2.execute-api.eu-north-1.amazonaws.com/v1',
    identityPoolId: 'eu-north-1:14cedb7e-3002-4cbd-b1f3-c27f5e1349ba',
  };

  // Just return the production config - no environment overrides needed
  // This eliminates the need for manual configuration

  return config;
};

export const awsConfig = {
  ...getAWSConfig(),
  themes: {
    default: 'general' as ThemeType,
    available: ['general', 'tech', 'business', 'creative', 'academic'] as ThemeType[],
  },
  features: {
    voiceInput: true,
    fileUpload: true,
    messageReactions: true,
    searchEnabled: true,
    integrations: {
      slack: true,
      jira: true,
    },
  },
};

// Direct AWS SDK Configuration - No Amplify needed
export const cognitoConfig = {
  region: awsConfig.region,
  userPoolId: awsConfig.userPoolId,
  userPoolWebClientId: awsConfig.userPoolWebClientId,
  identityPoolId: awsConfig.identityPoolId,
};

export default awsConfig; 