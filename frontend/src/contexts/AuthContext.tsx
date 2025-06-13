'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  CognitoIdentityProviderClient,
  GetUserCommand,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand
} from '@aws-sdk/client-cognito-identity-provider';
// Note: fromCognitoIdentityPool can be added later if needed for cross-service authentication

// AWS Configuration
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'eu-north-1',
});

const USER_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '';
const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '';

export type ThemeType = 'dev' | 'ops' | 'qa' | 'sales' | 'media';

interface UserProfile {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  theme: ThemeType;
  inviteCode?: string;
  createdAt: string;
  lastLoginAt: string;
}

interface AuthContextType {
  user: any | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
  confirmSignUp: (email: string, code: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  confirmForgotPassword: (email: string, code: string, newPassword: string) => Promise<boolean>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const isAuthenticated = !!user && !!accessToken;

  // Get user from access token
  const getUserFromToken = async (token: string) => {
    try {
      const command = new GetUserCommand({
        AccessToken: token,
      });
      
      const response = await cognitoClient.send(command);
      return {
        username: response.Username,
        attributes: response.UserAttributes?.reduce((acc: Record<string, string>, attr: any) => {
          if (attr.Name && attr.Value) {
            acc[attr.Name] = attr.Value;
          }
          return acc;
        }, {} as Record<string, string>)
      };
    } catch (error) {
      console.error('Error getting user from token:', error);
      return null;
    }
  };

  // Fetch user profile from our API
  const fetchUserProfile = async (authUser: any): Promise<UserProfile | null> => {
    try {
      if (!accessToken) return null;
      
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? '/api/user/profile' 
        : `${process.env.NEXT_PUBLIC_API_URL}/user/profile`;
        
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const profileData = await response.json();
        return {
          userId: authUser.username,
          email: authUser.attributes?.email || profileData.email,
          firstName: authUser.attributes?.given_name || profileData.firstName || '',
          lastName: authUser.attributes?.family_name || profileData.lastName || '',
          role: authUser.attributes?.['custom:userRole'] || 'dev',
          theme: (authUser.attributes?.['custom:theme'] || 'dev') as ThemeType,
          inviteCode: authUser.attributes?.['custom:inviteCode'],
          createdAt: profileData.createdAt || new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: CLIENT_ID,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      });

      const response = await cognitoClient.send(command);
      
      if (response.AuthenticationResult?.AccessToken) {
        const token = response.AuthenticationResult.AccessToken;
        setAccessToken(token);
        
        // Store token in localStorage for persistence
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', response.AuthenticationResult.RefreshToken || '');
        localStorage.setItem('idToken', response.AuthenticationResult.IdToken || '');
        
        const authUser = await getUserFromToken(token);
        if (authUser) {
          setUser(authUser);
          const profile = await fetchUserProfile(authUser);
          setUserProfile(profile);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error signing in:', error);
      return false;
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, firstName: string, lastName: string): Promise<boolean> => {
    try {
      const command = new SignUpCommand({
        ClientId: CLIENT_ID,
        Username: email,
        Password: password,
        UserAttributes: [
          {
            Name: 'email',
            Value: email,
          },
          {
            Name: 'given_name',
            Value: firstName,
          },
          {
            Name: 'family_name',
            Value: lastName,
          },
        ],
      });

      await cognitoClient.send(command);
      return true;
    } catch (error) {
      console.error('Error signing up:', error);
      return false;
    }
  };

  // Confirm sign up function
  const confirmSignUp = async (email: string, code: string): Promise<boolean> => {
    try {
      const command = new ConfirmSignUpCommand({
        ClientId: CLIENT_ID,
        Username: email,
        ConfirmationCode: code,
      });

      await cognitoClient.send(command);
      return true;
    } catch (error) {
      console.error('Error confirming sign up:', error);
      return false;
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      const command = new ForgotPasswordCommand({
        ClientId: CLIENT_ID,
        Username: email,
      });

      await cognitoClient.send(command);
      return true;
    } catch (error) {
      console.error('Error initiating forgot password:', error);
      return false;
    }
  };

  // Confirm forgot password function
  const confirmForgotPassword = async (email: string, code: string, newPassword: string): Promise<boolean> => {
    try {
      const command = new ConfirmForgotPasswordCommand({
        ClientId: CLIENT_ID,
        Username: email,
        ConfirmationCode: code,
        Password: newPassword,
      });

      await cognitoClient.send(command);
      return true;
    } catch (error) {
      console.error('Error confirming forgot password:', error);
      return false;
    }
  };

  // Check authentication status
  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        setAccessToken(token);
        const authUser = await getUserFromToken(token);
        
        if (authUser) {
          setUser(authUser);
          const profile = await fetchUserProfile(authUser);
          setUserProfile(profile);
        } else {
          // Token is invalid, clear storage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('idToken');
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      // Clear invalid tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('idToken');
      setUser(null);
      setUserProfile(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (user && accessToken) {
      const profile = await fetchUserProfile(user);
      setUserProfile(profile);
    }
  };

  // Sign out function
  const handleSignOut = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('idToken');
      
      setUser(null);
      setUserProfile(null);
      setAccessToken(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Check auth state on mount
  useEffect(() => {
    checkAuthState();
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    isLoading,
    isAuthenticated,
    signOut: handleSignOut,
    signIn,
    signUp,
    confirmSignUp,
    forgotPassword,
    confirmForgotPassword,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Authentication Required
            </h1>
            <p className="text-gray-600">
              Please sign in to access this page.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
} 