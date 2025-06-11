'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getCurrentUser, signOut, AuthUser, fetchAuthSession } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { configureAmplify, ThemeType } from '@/config/aws-config';

// Configure Amplify on module load
configureAmplify();

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
  user: AuthUser | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Fetch user profile from our API
  const fetchUserProfile = async (authUser: AuthUser): Promise<UserProfile | null> => {
    try {
      const { username } = authUser;
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken?.toString();
      
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const profileData = await response.json();
        return {
          userId: username,
          email: profileData.email,
          firstName: profileData.given_name || profileData.firstName,
          lastName: profileData.family_name || profileData.lastName,
          role: profileData.custom_role || 'dev',
          theme: (profileData.custom_theme || 'dev') as ThemeType,
          inviteCode: profileData.custom_inviteCode,
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

  // Check authentication status
  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        const profile = await fetchUserProfile(currentUser);
        setUserProfile(profile);
      }
    } catch (error) {
      // User is not authenticated
      setUser(null);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user);
      setUserProfile(profile);
    }
  };

  // Sign out function
  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Listen for auth events
  useEffect(() => {
    checkAuthState();

    const hubListener = (data: any) => {
      const { event } = data.payload;
      
      switch (event) {
        case 'signedIn':
          checkAuthState();
          break;
        case 'signedOut':
          setUser(null);
          setUserProfile(null);
          break;
        case 'tokenRefresh':
          // Optionally refresh user profile on token refresh
          break;
        default:
          break;
      }
    };

    const unsubscribe = Hub.listen('auth', hubListener);

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    isLoading,
    isAuthenticated,
    signOut: handleSignOut,
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
      // Redirect to login page - you can customize this
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